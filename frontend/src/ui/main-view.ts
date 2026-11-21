import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { signedUrls } from "../api/signed-urls";
import { isCameraOffline, snapshotUrl } from "../api/snapshot";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { LivePlayer, type PlayerStatus } from "../player/live-player";
import { Talk, type TalkUpdate, talkUnavailableReason } from "../player/talk";
import { VodPlayer, type VodState } from "../player/vod-player";
import { recordingPlaylistPath } from "../reviews";
import { spinnerStyles, tokens } from "../styles";
import type { ControlAction, TalkState } from "./player-controls";
import "./player-controls";
import "./ptz-pad";
import "./talk-banner";
import { errorMessage } from "../errors";

const FADE_MS = 180;
const CONTROLS_HIDE_MS = 4000;
// A rewind loads this much recording; at its end the next part loads.
const PLAYBACK_WINDOW_SECONDS = 30 * 60;
// Frigate writes recording segments with a short delay, so playback stays
// this far behind now.
const RECORDING_DELAY_SECONDS = 15;

interface Playback {
  // Epoch seconds of the loaded recording.
  windowStart: number;
  windowEnd: number;
}

// The large view of one camera: live, or rewound into its recording.
//
// A camera change shows the camera's latest still at once, from the same
// URL the tiles use, so it comes from the browser cache. The stream starts on
// a second, hidden video element. When it plays, that element comes to the
// front and the still fades out. The previous camera never shows under the
// new camera's name, and the view never goes black.
export class MainView extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    snapshotRefresh: { attribute: false },
    timelineOpen: { attribute: false },
    pinnable: { attribute: false },
    pinned: { attribute: false },
    statuses: { state: true },
    shown: { state: true },
    playback: { state: true },
    vodState: { state: true },
    vodMessage: { state: true },
    muted: { state: true },
    paused: { state: true },
    position: { state: true },
    duration: { state: true },
    rate: { state: true },
    controlsVisible: { state: true },
    fullscreen: { state: true },
    talkUpdate: { state: true },
    ptzOpen: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera | undefined;
  // The tiles use the same value, so the snapshot comes from the browser
  // cache and shows at once while the stream connects.
  declare snapshotRefresh: number;
  // The card shows the timeline; the rewind button shows it as on.
  declare timelineOpen: boolean;
  // The card's idle return can be paused; the view shows and toggles it.
  declare pinnable: boolean;
  declare pinned: boolean;
  // One status per live video element.
  declare statuses: [PlayerStatus, PlayerStatus];
  // The live video element on screen.
  declare shown: 0 | 1;
  declare playback: Playback | undefined;
  declare vodState: VodState;
  declare vodMessage: string | undefined;
  declare muted: boolean;
  declare paused: boolean;
  declare position: number;
  declare duration: number;
  declare rate: number;
  declare controlsVisible: boolean;
  declare fullscreen: boolean;
  declare talkUpdate: TalkUpdate;
  declare ptzOpen: boolean;

  private readonly talk = new Talk(
    () => this.hass,
    (update) => (this.talkUpdate = update),
  );
  private talkErrorTimer?: ReturnType<typeof setTimeout>;
  private players: LivePlayer[] = [];
  private vod?: VodPlayer;
  // The live video element that plays the current camera.
  private target: 0 | 1 = 0;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.timelineOpen = false;
    this.statuses = [{ state: "connecting" }, { state: "connecting" }];
    this.shown = 0;
    this.vodState = "loading";
    this.muted = true;
    this.paused = false;
    this.position = 0;
    this.duration = 0;
    this.rate = 1;
    this.controlsVisible = false;
    this.fullscreen = false;
    this.talkUpdate = { phase: "idle", level: 0 };
    this.ptzOpen = false;
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.stopLive();
      this.vodVideo?.pause();
    } else if (!this.playback) {
      this.startLive();
    }
  };

  private readonly onFullscreenChange = () => {
    this.fullscreen = document.fullscreenElement === this.frame;
  };

  private get frame(): HTMLElement | null {
    return this.renderRoot.querySelector(".frame");
  }

  private get vodVideo(): HTMLVideoElement | null {
    return this.renderRoot.querySelector("video.vod");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    // A view that comes back (for example after a layout change) starts live.
    if (this.players.length) {
      this.startLive();
      this.reportPosition(null);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    clearTimeout(this.hideTimer);
    this.stopLive();
    this.closeVod();
    this.playback = undefined;
    this.talk.close();
  }

  override firstUpdated(): void {
    const videos = [...this.renderRoot.querySelectorAll<HTMLVideoElement>("video.live")];
    this.players = videos.map(
      (video, index) =>
        new LivePlayer(
          () => this.hass,
          video,
          (status) => this.onStatus(index as 0 | 1, status),
        ),
    );
    const vod = this.vodVideo!;
    vod.addEventListener("timeupdate", () => {
      this.position = vod.currentTime;
      if (this.playback) this.reportPosition(this.playback.windowStart + vod.currentTime);
    });
    vod.addEventListener("durationchange", () => (this.duration = vod.duration || 0));
    vod.addEventListener("play", () => (this.paused = false));
    vod.addEventListener("pause", () => (this.paused = true));
    vod.addEventListener("ended", () => this.onPlaybackEnded());
    this.startLive();
    this.reportPosition(null);
  }

  override updated(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous && previous.entity_id !== this.camera?.entity_id) {
      if (this.playback) this.goLive();
      else this.switchCamera();
        this.ptzOpen = false;
      this.talk.close();
      this.talkUpdate = { phase: "idle", level: 0 };
    }
    for (const video of this.renderRoot.querySelectorAll("video")) {
      video.muted = this.muted;
    }
  }

  // Shows the controls, and hides them again after a while when nothing
  // needs them.
  private showControls(): void {
    this.controlsVisible = true;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      const needed =
        this.timelineOpen || this.ptzOpen || this.talkUpdate.phase !== "idle" || (this.playback && this.paused);
      if (!needed) this.controlsVisible = false;
    }, CONTROLS_HIDE_MS);
  }

  // --- Live -----------------------------------------------------------------

  private onStatus(index: 0 | 1, status: PlayerStatus): void {
    const statuses: [PlayerStatus, PlayerStatus] = [...this.statuses];
    statuses[index] = status;
    this.statuses = statuses;
    if (index === this.target && status.state === "playing" && this.shown !== index) {
      const previous = this.shown;
      this.shown = index;
      setTimeout(() => {
        if (this.target !== previous) this.players[previous]?.stop();
      }, FADE_MS + 50);
    }
  }

  private source() {
    if (!this.camera) return undefined;
    return {
      instanceId: this.camera.instance_id,
      stream: this.camera.stream,
      iceEntityId: this.camera.entity_id,
    };
  }

  // Start the current camera on the element that is on screen.
  private startLive(): void {
    const source = this.source();
    if (!source || document.hidden) return;
    this.target = this.shown;
    this.players[this.target]?.play(source, this.camera?.fallback_stream);
  }

  // Start the new camera on the hidden element, if a camera is on screen.
  private switchCamera(): void {
    const source = this.source();
    if (!source || document.hidden) return;
    if (this.statuses[this.shown].state !== "playing") {
      this.startLive();
      return;
    }
    this.target = this.shown === 0 ? 1 : 0;
    this.players[this.target]?.play(source, this.camera?.fallback_stream);
  }

  private stopLive(): void {
    for (const player of this.players) player.stop();
    this.statuses = [{ state: "connecting" }, { state: "connecting" }];
  }

  // --- Rewind -----------------------------------------------------------------

  // Plays the recording from `time` (epoch seconds).
  private rewindTo(time: number): void {
    const camera = this.camera;
    const video = this.vodVideo;
    if (!camera || !video) return;
    const latest = Date.now() / 1000 - RECORDING_DELAY_SECONDS;
    if (time >= latest - 5) {
      this.goLive();
      return;
    }
    const windowStart = Math.floor(time - 5);
    const windowEnd = Math.floor(Math.min(latest, time + PLAYBACK_WINDOW_SECONDS));
    this.stopLive();
    this.closeVod();
    this.playback = { windowStart, windowEnd };
    this.position = time - windowStart;
    this.duration = windowEnd - windowStart;
    video.playbackRate = this.rate;
    const vod = new VodPlayer(video, (state, message) => {
      this.vodState = state;
      this.vodMessage = message;
    });
    this.vod = vod;
    const path = recordingPlaylistPath(camera.instance_id, camera.frigate_name, windowStart, windowEnd);
    signedUrls.get(this.hass, path).then(
      (url) => {
        if (this.vod === vod) void vod.load(url, time - windowStart);
      },
      (error) => {
        this.vodState = "error";
        this.vodMessage = errorMessage(error);
      },
    );
  }

  // Plays the camera's recording from `time` (epoch seconds).
  playRecording(time: number): void {
    if (!this.seekInWindow(time)) this.rewindTo(time);
  }

  // Shows `time` while the user drags the timeline's play line. It only
  // seeks inside the loaded recording; a time outside it waits for the
  // drag to end.
  previewRecording(time: number): void {
    this.seekInWindow(time);
  }

  private seekInWindow(time: number): boolean {
    const playback = this.playback;
    const video = this.vodVideo;
    if (!playback || !video || this.vodState !== "ready") return false;
    if (time < playback.windowStart || time > playback.windowEnd - 5) return false;
    video.currentTime = time - playback.windowStart;
    return true;
  }

  // Tells the card which time plays, or null for live, so the timeline can
  // follow it.
  private reportPosition(time: number | null): void {
    this.dispatchEvent(
      new CustomEvent("playback-position", { detail: time, bubbles: true, composed: true }),
    );
  }

  private onPlaybackEnded(): void {
    const playback = this.playback;
    if (!playback) return;
    // The window ended: continue with the next part, or go live at the end.
    this.rewindTo(playback.windowEnd);
  }

  goLive(): void {
    this.closeVod();
    this.playback = undefined;
    this.reportPosition(null);
    this.rate = 1;
    this.startLive();
  }

  private closeVod(): void {
    this.vod?.close();
    this.vod = undefined;
  }

  // --- Controls -----------------------------------------------------------------

  private onControl(event: CustomEvent<ControlAction>): void {
    this.showControls();
    const video = this.vodVideo;
    const control = event.detail;
    switch (control.action) {
      case "mute":
        this.muted = true;
        break;
      case "unmute":
        this.muted = false;
        break;
      case "play":
        void video?.play();
        break;
      case "pause":
        video?.pause();
        break;
      case "seek":
        if (video) video.currentTime = control.seconds;
        break;
      case "skip":
        if (video) video.currentTime = Math.max(0, video.currentTime + control.seconds);
        break;
      case "rate":
        this.rate = control.rate;
        if (video) video.playbackRate = control.rate;
        break;
      case "rewind":
        this.dispatchEvent(new CustomEvent("timeline-toggle", { bubbles: true, composed: true }));
        break;
      case "live":
        this.goLive();
        break;
      case "fullscreen":
        void this.toggleFullscreen();
        break;
      case "talk-start": {
        const source = this.source();
        const reason = talkUnavailableReason();
        clearTimeout(this.talkErrorTimer);
        if (reason) this.talkUpdate = { phase: "error", level: 0, message: reason };
        else if (source) void this.talk.press(source);
        break;
      }
      case "talk-stop":
        this.talk.release();
        if (this.talkUpdate.phase === "error") {
          this.talkErrorTimer = setTimeout(() => (this.talkUpdate = { phase: "idle", level: 0 }), 4000);
        }
        break;
      case "ptz":
        this.ptzOpen = !this.ptzOpen;
        break;
      case "pin":
        this.dispatchEvent(new CustomEvent("pin-toggle", { bubbles: true, composed: true }));
        break;
    }
  }

  private async toggleFullscreen(): Promise<void> {
    const frame = this.frame;
    if (!frame) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (frame.requestFullscreen) {
      await frame.requestFullscreen();
    } else {
      // iOS has no element full screen; its video player is the fallback.
      const video = (this.playback ? this.vodVideo : this.renderRoot.querySelectorAll("video.live")[this.shown]) as
        | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
        | null;
      video?.webkitEnterFullscreen?.();
    }
  }

  private talkState(): TalkState | undefined {
    if (!this.camera?.talk) return undefined;
    const reason = talkUnavailableReason();
    return {
      available: !reason,
      active: this.talkUpdate.phase === "talking" || this.talkUpdate.phase === "connecting",
      reason,
    };
  }

  // --- Render -----------------------------------------------------------------

  override render() {
    const camera = this.camera;
    const status = this.statuses[this.target];
    const live = !this.playback;
    const playing = live ? status.state === "playing" : this.vodState === "ready";
    const offline = camera ? isCameraOffline(this.hass, camera.entity_id) : false;
    const snapshot =
      camera && !offline && live
        ? snapshotUrl(this.hass, camera.entity_id, this.snapshotRefresh)
        : undefined;
    const clock = this.playback
      ? new Date((this.playback.windowStart + this.position) * 1000).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : undefined;
    const message = offline
      ? "This camera is offline."
      : live && status.state === "retrying"
        ? `${status.reason}. Trying again in ${status.inSeconds} s.`
        : !live && this.vodState === "error"
          ? this.vodMessage
          : undefined;
    const showChrome =
      this.controlsVisible ||
      this.timelineOpen ||
      this.ptzOpen ||
      this.talkUpdate.phase !== "idle" ||
      (!live && this.paused);

    return html`
      <div class="view">
      <div class="frame" @pointerdown=${() => this.showControls()}>
        <video class="live ${live && this.shown === 0 ? "on" : ""}" muted playsinline autoplay></video>
        <video class="live ${live && this.shown === 1 ? "on" : ""}" muted playsinline autoplay></video>
        <video class="vod ${live ? "" : "on"}" muted playsinline></video>
        ${snapshot
          ? html`<img class="snapshot ${playing ? "faded" : ""}" src=${snapshot} alt="" />`
          : nothing}
        <div class="shade top"></div>
        <div class="overlay top">
          ${live
            ? html`<span class="badge ${playing ? "live" : ""}">
                <span class="dot"></span>${playing ? "Live" : offline ? "Offline" : "Connecting"}
              </span>`
            : html`<span class="badge recording"><ha-icon icon="mdi:history"></ha-icon>${clock}</span>`}
          <span class="name">${camera?.name ?? ""}</span>
          ${this.pinned ? html`<ha-icon class="pinned" icon="mdi:pin" title="Staying on this camera"></ha-icon>` : nothing}
        </div>
        ${message ? html`<div class="message">${message}</div>` : nothing}
        <camera-hub-talk-banner .talk=${this.talkUpdate}></camera-hub-talk-banner>
        ${live && this.ptzOpen && camera?.ptz
          ? html`<camera-hub-ptz-pad class="ptz" .hass=${this.hass} .camera=${camera}></camera-hub-ptz-pad>`
          : nothing}
        ${!playing && !offline && !message
          ? html`<div class="spinner ${snapshot ? "corner" : ""}"></div>`
          : nothing}
      </div>
        <div class="chrome ${showChrome ? "visible" : ""}" @control=${this.onControl}>
          <div class="shade bottom"></div>
          <camera-hub-player-controls
            .mode=${live ? "live" : "playback"}
            .paused=${this.paused}
            .muted=${this.muted}
            .position=${this.position}
            .duration=${this.duration}
            .clockStart=${this.playback?.windowStart}
            .rate=${this.rate}
            .fullscreen=${this.fullscreen}
            .rewinding=${this.timelineOpen}
            .talk=${live ? this.talkState() : undefined}
            .ptz=${live && (camera?.ptz ?? false)}
            .ptzOpen=${this.ptzOpen}
            .pinnable=${this.pinnable}
            .pinned=${this.pinned}
          ></camera-hub-player-controls>
        </div>
      </div>
    `;
  }

  static override styles = [
    tokens,
    spinnerStyles,
    css`
      :host {
        display: block;
      }
      .view {
        position: relative;
        container-type: inline-size;
      }
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
        /* The card can limit the height (tablet), so the alerts under the
           video stay on screen. The frame then gets narrower, not cut. */
        max-height: var(--ch-main-max-height, none);
        max-width: calc(var(--ch-main-max-height, 100vw) * 16 / 9);
        margin-inline: auto;
        background: #000;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
      }
      .frame:fullscreen {
        aspect-ratio: auto;
        border-radius: 0;
      }
      video,
      .snapshot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      video {
        visibility: hidden;
      }
      video.on {
        visibility: visible;
      }
      /* Frigate's stills come from the detect stream, which can be a squeezed
         copy of the 16:9 picture (for example 704x480). Stretching it to the
         frame matches the live video. */
      .snapshot {
        object-fit: fill;
        background: #000;
        transition: opacity ${FADE_MS}ms ease;
      }
      .snapshot.faded {
        opacity: 0;
      }
      .shade {
        position: absolute;
        left: 0;
        right: 0;
        pointer-events: none;
      }
      .shade.top {
        top: 0;
        height: 72px;
        background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
      }
      .shade.bottom {
        bottom: 0;
        height: 160px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      }
      .overlay.top {
        position: absolute;
        inset: 14px 16px auto 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .name {
        font-size: 20px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      .pinned {
        --mdc-icon-size: 20px;
        color: var(--ch-accent);
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.5);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-variant-numeric: tabular-nums;
      }
      .badge .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-text-secondary);
      }
      .badge.live .dot {
        background: var(--ch-red);
      }
      .badge.recording {
        background: var(--ch-amber);
        color: #000;
        --mdc-icon-size: 14px;
      }
      .message {
        position: absolute;
        inset: auto 16px 80px 16px;
        padding: 10px 14px;
        border-radius: var(--ch-radius-thumb);
        background: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
      /* Over a snapshot the spinner moves out of the way. */
      .spinner.corner {
        top: 18px;
        left: auto;
        right: 18px;
        width: 22px;
        height: 22px;
        margin: 0;
        border-width: 2px;
      }
      .ptz {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
      }
      .chrome {
        position: absolute;
        inset: auto 0 0 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 200ms ease;
      }
      .chrome.visible {
        opacity: 1;
        pointer-events: auto;
      }
      .chrome > :not(.shade) {
        position: relative;
      }
      /* On a phone the controls sit under the video, always visible, so they
         cover nothing and need no tap to appear. */
      @container (max-width: 600px) {
        .chrome {
          position: static;
          opacity: 1;
          pointer-events: auto;
        }
        .chrome .shade {
          display: none;
        }
        .name {
          font-size: 16px;
        }
        .ptz {
          right: 8px;
          transform: translateY(-50%) scale(0.8);
          transform-origin: right center;
        }
      }
    `,
  ];
}

customElements.define("camera-hub-main-view", MainView);
