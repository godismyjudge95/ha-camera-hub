import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { signedUrls } from "../api/signed-urls";
import type { HomeAssistant } from "../ha-types";
import { VodPlayer, type VodState } from "../player/vod-player";
import { type Review, clipPlaylistPath, reviewLabel, thumbnailPath } from "../reviews";
import { spinnerStyles, tokens } from "../styles";
import type { ControlAction } from "./player-controls";
import "./player-controls";

// A large player for one alert. It starts playing at once, without sound.
export class ClipModal extends LitElement {
  static override properties = {
    hass: { attribute: false },
    review: { attribute: false },
    instanceId: { attribute: false },
    cameraName: { attribute: false },
    poster: { state: true },
    vodState: { state: true },
    message: { state: true },
    playing: { state: true },
    paused: { state: true },
    muted: { state: true },
    position: { state: true },
    duration: { state: true },
    rate: { state: true },
    fullscreen: { state: true },
  };

  declare hass: HomeAssistant;
  declare review: Review;
  declare instanceId: string;
  declare cameraName: string;
  // The alert's thumbnail, shown until the clip plays.
  declare poster: string | undefined;
  declare vodState: VodState;
  declare message: string | undefined;
  declare playing: boolean;
  declare paused: boolean;
  declare muted: boolean;
  declare position: number;
  declare duration: number;
  declare rate: number;
  declare fullscreen: boolean;

  private player?: VodPlayer;

  constructor() {
    super();
    this.vodState = "loading";
    this.playing = false;
    this.paused = false;
    this.muted = true;
    this.position = 0;
    this.duration = 0;
    this.rate = 1;
    this.fullscreen = false;
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.close();
  };

  private readonly onFullscreenChange = () => {
    this.fullscreen = document.fullscreenElement === this.frame;
  };

  private get video(): HTMLVideoElement | null {
    return this.renderRoot.querySelector("video");
  }

  private get frame(): HTMLElement | null {
    return this.renderRoot.querySelector(".video");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    this.player?.close();
  }

  override firstUpdated(): void {
    const video = this.video!;
    video.addEventListener("playing", () => (this.playing = true));
    video.addEventListener("timeupdate", () => (this.position = video.currentTime));
    video.addEventListener("durationchange", () => (this.duration = video.duration || 0));
    video.addEventListener("play", () => (this.paused = false));
    video.addEventListener("pause", () => (this.paused = true));
    this.load();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("review") && changed.get("review")) this.load();
    if (this.video) this.video.muted = this.muted;
  }

  private load(): void {
    const video = this.video;
    if (!video) return;
    this.player?.close();
    this.poster = undefined;
    this.playing = false;
    this.position = 0;
    void signedUrls.get(this.hass, thumbnailPath(this.instanceId, this.review)).then(
      (url) => (this.poster = url),
      () => undefined,
    );
    const path = clipPlaylistPath(this.instanceId, this.review);
    if (!path) return;
    const player = new VodPlayer(video, (state, message) => {
      this.vodState = state;
      this.message = message;
    });
    this.player = player;
    signedUrls.get(this.hass, path).then(
      (url) => {
        if (this.player === player) void player.load(url);
      },
      (error) => {
        this.vodState = "error";
        this.message = (error as { message?: string }).message ?? String(error);
      },
    );
  }

  private onControl(event: CustomEvent<ControlAction>): void {
    const video = this.video;
    const control = event.detail;
    if (!video) return;
    switch (control.action) {
      case "play":
        void video.play();
        break;
      case "pause":
        video.pause();
        break;
      case "seek":
        video.currentTime = control.seconds;
        break;
      case "skip":
        video.currentTime = Math.max(0, video.currentTime + control.seconds);
        break;
      case "rate":
        this.rate = control.rate;
        video.playbackRate = control.rate;
        break;
      case "mute":
        this.muted = true;
        break;
      case "unmute":
        this.muted = false;
        break;
      case "fullscreen":
        if (document.fullscreenElement) void document.exitFullscreen();
        else void this.frame?.requestFullscreen?.();
        break;
      default:
        break;
    }
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent("clip-close", { bubbles: true, composed: true }));
  }

  override render() {
    const started = new Date(this.review.start_time * 1000);
    const time = started.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const day = started.toLocaleDateString([], { weekday: "short" });
    return html`
      <div class="backdrop" @click=${this.close}></div>
      <div class="panel" role="dialog" aria-label="Alert clip">
        <div class="header">
          <div class="title">
            <span class="label">${reviewLabel(this.review)}</span>
            <span class="meta">${this.cameraName} · ${day} ${time}</span>
          </div>
          <button class="close" @click=${this.close} aria-label="Close">
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="video">
          <video muted playsinline></video>
          ${this.poster && !this.playing
            ? html`<img class="poster" src=${this.poster} alt="" />`
            : nothing}
          ${this.vodState === "error"
            ? html`<div class="message">${this.message}</div>`
            : !this.playing
              ? html`<div class="spinner"></div>`
              : nothing}
          <div class="controls" @control=${this.onControl}>
            <camera-hub-player-controls
              .mode=${"clip"}
              .paused=${this.paused}
              .muted=${this.muted}
              .position=${this.position}
              .duration=${this.duration}
              .rate=${this.rate}
              .fullscreen=${this.fullscreen}
            ></camera-hub-player-controls>
          </div>
        </div>
      </div>
    `;
  }

  static override styles = [
    tokens,
    spinnerStyles,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: grid;
        place-items: center;
        padding: 16px;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        animation: fade 150ms ease;
      }
      .panel {
        position: relative;
        width: min(1100px, 100%, calc((100vh - 120px) * 16 / 9));
        animation: rise 180ms ease;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .title {
        display: flex;
        flex-direction: column;
      }
      .label {
        font-size: 20px;
        font-weight: 600;
      }
      .meta {
        font-size: 13px;
        color: var(--ch-text-secondary);
      }
      .close {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border: 0;
        border-radius: 50%;
        background: var(--ch-surface-raised);
        color: var(--ch-text);
        cursor: pointer;
        touch-action: manipulation;
      }
      .video {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      .video:fullscreen {
        aspect-ratio: auto;
        border-radius: 0;
      }
      video,
      .poster {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      video {
        object-fit: contain;
      }
      .poster {
        object-fit: fill;
      }
      .controls {
        position: absolute;
        inset: auto 0 0 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      }
      .message {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--ch-text-secondary);
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
      }
    `,
  ];
}

customElements.define("camera-hub-clip-modal", ClipModal);
