import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { isCameraOffline, snapshotUrl } from "../api/snapshot";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { LivePlayer, type PlayerStatus } from "../player/live-player";
import { tokens } from "../styles";

const FADE_MS = 180;

// The large live view of one camera.
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
    statuses: { state: true },
    shown: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera | undefined;
  // The tiles use the same value, so the snapshot comes from the browser
  // cache and shows at once while the stream connects.
  declare snapshotRefresh: number;
  // One status per video element.
  declare statuses: [PlayerStatus, PlayerStatus];
  // The video element on screen.
  declare shown: 0 | 1;

  private players: LivePlayer[] = [];
  // The video element that plays the current camera.
  private target: 0 | 1 = 0;

  constructor() {
    super();
    this.statuses = [{ state: "connecting" }, { state: "connecting" }];
    this.shown = 0;
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) this.stopAll();
    else this.start();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    if (this.players.length) this.start();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.stopAll();
  }

  override firstUpdated(): void {
    const videos = [...this.renderRoot.querySelectorAll("video")];
    this.players = videos.map(
      (video, index) =>
        new LivePlayer(
          () => this.hass,
          video,
          (status) => this.onStatus(index as 0 | 1, status),
        ),
    );
    this.start();
  }

  override updated(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (
      changed.has("camera") &&
      previous &&
      previous.entity_id !== this.camera?.entity_id &&
      this.players.length
    ) {
      this.switchCamera();
    }
  }

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
  private start(): void {
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
      this.start();
      return;
    }
    this.target = this.shown === 0 ? 1 : 0;
    this.players[this.target]?.play(source);
  }

  private stopAll(): void {
    for (const player of this.players) player.stop();
  }

  override render() {
    const camera = this.camera;
    const status = this.statuses[this.target];
    const playing = status.state === "playing";
    const offline = camera ? isCameraOffline(this.hass, camera.entity_id) : false;
    const snapshot =
      camera && !offline
        ? snapshotUrl(this.hass, camera.entity_id, this.snapshotRefresh)
        : undefined;

    return html`
      <div class="frame">
        <video class=${this.shown === 0 ? "on" : ""} muted playsinline autoplay></video>
        <video class=${this.shown === 1 ? "on" : ""} muted playsinline autoplay></video>
        ${snapshot
          ? html`<img class="snapshot ${playing ? "faded" : ""}" src=${snapshot} alt="" />`
          : nothing}
        <div class="shade top"></div>
        <div class="overlay top">
          <span class="live ${playing ? "on" : ""}">
            <span class="dot"></span>${playing ? "Live" : offline ? "Offline" : "Connecting"}
          </span>
          <span class="name">${camera?.name ?? ""}</span>
        </div>
        ${offline
          ? html`<div class="message">This camera is offline.</div>`
          : status.state === "retrying"
            ? html`<div class="message">
                ${status.reason}. Trying again in ${status.inSeconds} s.
              </div>`
            : nothing}
        ${!playing && !offline ? html`<div class="spinner ${snapshot ? "corner" : ""}"></div>` : nothing}
      </div>
    `;
  }

  static override styles = [
    tokens,
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
      .shade.top {
        position: absolute;
        inset: 0 0 auto 0;
        height: 72px;
        background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
        pointer-events: none;
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
      .live {
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
      }
      .live .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-text-secondary);
      }
      .live.on .dot {
        background: var(--ch-red);
      }
      .message {
        position: absolute;
        inset: auto 16px 16px 16px;
        padding: 10px 14px;
        border-radius: var(--ch-radius-thumb);
        background: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
      .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 36px;
        height: 36px;
        margin: -18px 0 0 -18px;
        border: 3px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--ch-text);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
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
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];
}

customElements.define("camera-hub-main-view", MainView);
