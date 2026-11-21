import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import type { HomeAssistant, HubCamera } from "../ha-types";
import { LivePlayer, type PlayerStatus } from "../player/live-player";
import { tokens } from "../styles";

// The large live view of one camera.
export class MainView extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    status: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera | undefined;
  declare status: PlayerStatus;

  private player?: LivePlayer;

  constructor() {
    super();
    this.status = { state: "connecting" };
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) this.player?.stop();
    else this.startPlayer();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    if (this.player) this.startPlayer();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.player?.stop();
  }

  override firstUpdated(): void {
    const video = this.renderRoot.querySelector("video")!;
    this.player = new LivePlayer(() => this.hass, video, (status) => (this.status = status));
    this.startPlayer();
  }

  override updated(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous?.entity_id !== this.camera?.entity_id && this.player) {
      this.startPlayer();
    }
  }

  private startPlayer(): void {
    if (!this.camera || document.hidden) return;
    this.player?.play({
      instanceId: this.camera.instance_id,
      stream: this.camera.stream,
      iceEntityId: this.camera.entity_id,
    });
  }

  override render() {
    const playing = this.status.state === "playing";
    return html`
      <div class="frame">
        <video muted playsinline autoplay></video>
        <div class="shade top"></div>
        <div class="overlay top">
          <span class="live ${playing ? "on" : ""}">
            <span class="dot"></span>${playing ? "Live" : "Connecting"}
          </span>
          <span class="name">${this.camera?.name ?? ""}</span>
          ${playing
            ? html`<span class="mode">${this.status.state === "playing" ? this.status.mode.toUpperCase() : ""}</span>`
            : nothing}
        </div>
        ${this.status.state === "retrying"
          ? html`<div class="message">
              ${this.status.reason}. Trying again in ${this.status.inSeconds} s.
            </div>`
          : nothing}
        ${this.status.state === "connecting" ? html`<div class="spinner"></div>` : nothing}
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
        background: var(--ch-surface);
        border-radius: var(--ch-radius-main);
        overflow: hidden;
      }
      video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
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
      .mode {
        margin-left: auto;
        font-size: 11px;
        letter-spacing: 0.08em;
        color: var(--ch-text-secondary);
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
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];
}

customElements.define("camera-hub-main-view", MainView);
