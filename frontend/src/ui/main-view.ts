import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { signedUrls } from "../api/signed-urls";
import { isCameraOffline, snapshotUrl } from "../api/snapshot";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { LivePlayer, type PlayerStatus } from "../player/live-player";
import { Talk, type TalkUpdate, talkUnavailableReason } from "../player/talk";
import { VodPlayer, type VodState } from "../player/vod-player";
import { type Review, recordingPlaylistPath, reviewLabel } from "../reviews";
import { spinnerStyles, tokens } from "../styles";
import type { ControlAction, TalkState } from "./player-controls";
import type { TimelineMarker } from "./timeline";
import "./player-controls";
import "./ptz-pad";
import "./talk-banner";
import "./timeline";
import { errorMessage } from "../errors";

const FADE_MS = 180;
const CONTROLS_HIDE_MS = 4000;
// How far back the rewind timeline reaches.
const TIMELINE_SECONDS = 3 * 3600;
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
    reviews: { attribute: false },
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
    rewinding: { state: true },
    controlsVisible: { state: true },
    fullscreen: { state: true },
    now: { state: true },
    talkUpdate: { state: true },
    ptzOpen: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera | undefined;
  // The tiles use the same value, so the snapshot comes from the browser
  // cache and shows at once while the stream connects.
  declare snapshotRefresh: number;
  // Recent alerts of all cameras; the timeline marks this camera's.
  declare reviews: Review[];
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
  // The rewind timeline is open.
  declare rewinding: boolean;
  declare controlsVisible: boolean;
  declare fullscreen: boolean;
  declare now: number;
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
  private clock?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.reviews = [];
    this.statuses = [{ state: "connecting" }, { state: "connecting" }];
    this.shown = 0;
    this.vodState = "loading";
    this.muted = true;
    this.paused = false;
    this.position = 0;
    this.duration = 0;
    this.rate = 1;
    this.rewinding = false;
    this.controlsVisible = false;
    this.fullscreen = false;
    this.now = Date.now() / 1000;
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
    this.clock = setInterval(() => (this.now = Date.now() / 1000), 30_000);
    if (this.players.length && !this.playback) this.startLive();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    clearInterval(this.clock);
    clearTimeout(this.hideTimer);
    this.stopLive();
    this.closeVod();
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
    vod.addEventListener("timeupdate", () => (this.position = vod.currentTime));
    vod.addEventListener("durationchange", () => (this.duration = vod.duration || 0));
    vod.addEventListener("play", () => (this.paused = false));
    vod.addEventListener("pause", () => (this.paused = true));
    vod.addEventListener("ended", () => this.onPlaybackEnded());
    this.startLive();
  }

  override updated(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous && previous.entity_id !== this.camera?.entity_id) {
      if (this.playback) this.goLive();
      else this.switchCamera();
      this.rewinding = false;
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
        this.rewinding || this.ptzOpen || this.talkUpdate.phase !== "idle" || (this.playback && this.paused);
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
    this.players[this.target]?.play(source);
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
    this.players[this.target]?.play(source);
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

  private onPlaybackEnded(): void {
    const playback = this.playback;
    if (!playback) return;
    // The window ended: continue with the next part, or go live at the end.
    this.rewindTo(playback.windowEnd);
  }

  private goLive(): void {
    this.closeVod();
    this.playback = undefined;
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
        this.rewinding = !this.rewinding;
        this.now = Date.now() / 1000;
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

  private timelineMarkers(): TimelineMarker[] {
    const camera = this.camera;
    if (!camera) return [];
    return this.reviews
      .filter((review) => review.camera === camera.frigate_name)
      .map((review) => ({ time: review.start_time, label: reviewLabel(review) }));
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
      this.rewinding ||
      this.ptzOpen ||
      this.talkUpdate.phase !== "idle" ||
      (!live && this.paused);

    return html`
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
        </div>
        ${message ? html`<div class="message">${message}</div>` : nothing}
        <camera-hub-talk-banner .talk=${this.talkUpdate}></camera-hub-talk-banner>
        ${live && this.ptzOpen && camera?.ptz
          ? html`<camera-hub-ptz-pad class="ptz" .hass=${this.hass} .camera=${camera}></camera-hub-ptz-pad>`
          : nothing}
        ${!playing && !offline && !message
          ? html`<div class="spinner ${snapshot ? "corner" : ""}"></div>`
          : nothing}
        <div class="chrome ${showChrome ? "visible" : ""}" @control=${this.onControl}>
          <div class="shade bottom"></div>
          ${this.rewinding
            ? html`<camera-hub-timeline
                .start=${this.now - TIMELINE_SECONDS}
                .end=${this.now}
                .markers=${this.timelineMarkers()}
                .position=${this.playback ? this.playback.windowStart + this.position : undefined}
                @timeline-seek=${(event: CustomEvent<number>) => {
                  this.showControls();
                  this.rewindTo(event.detail);
                }}
              ></camera-hub-timeline>`
            : nothing}
          <camera-hub-player-controls
            .mode=${live ? "live" : "playback"}
            .paused=${this.paused}
            .muted=${this.muted}
            .position=${this.position}
            .duration=${this.duration}
            .clockStart=${this.playback?.windowStart}
            .rate=${this.rate}
            .fullscreen=${this.fullscreen}
            .rewinding=${this.rewinding}
            .talk=${live ? this.talkState() : undefined}
            .ptz=${live && (camera?.ptz ?? false)}
            .ptzOpen=${this.ptzOpen}
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
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
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
    `,
  ];
}

customElements.define("camera-hub-main-view", MainView);
