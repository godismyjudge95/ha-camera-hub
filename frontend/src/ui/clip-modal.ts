import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { signedUrls } from "../api/signed-urls";
import type { HomeAssistant } from "../ha-types";
import { type Review, clipPath, reviewLabel, thumbnailPath } from "../reviews";
import { tokens } from "../styles";

// A large player for one alert. It starts playing at once, without sound.
export class ClipModal extends LitElement {
  static override properties = {
    hass: { attribute: false },
    review: { attribute: false },
    instanceId: { attribute: false },
    cameraName: { attribute: false },
    url: { state: true },
    poster: { state: true },
    playing: { state: true },
    error: { state: true },
  };

  declare hass: HomeAssistant;
  declare review: Review;
  declare instanceId: string;
  declare cameraName: string;
  declare url: string | undefined;
  // The alert's thumbnail, shown until the clip plays.
  declare poster: string | undefined;
  declare playing: boolean;
  declare error: string | undefined;

  constructor() {
    super();
    this.playing = false;
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.close();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.onKeyDown);
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("review")) {
      this.url = undefined;
      this.poster = undefined;
      this.playing = false;
      void signedUrls.get(this.hass, thumbnailPath(this.instanceId, this.review)).then(
        (url) => (this.poster = url),
        () => undefined,
      );
      this.error = undefined;
      const path = clipPath(this.instanceId, this.review);
      if (!path) return;
      void signedUrls.get(this.hass, path).then(
        (url) => (this.url = url),
        (error) => (this.error = (error as { message?: string }).message ?? String(error)),
      );
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
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <div class="video">
          ${this.poster && !this.playing
            ? html`<img class="poster" src=${this.poster} alt="" />`
            : nothing}
          ${this.url
            ? html`<video
                src=${this.url}
                autoplay
                muted
                playsinline
                controls
                @playing=${() => (this.playing = true)}
                @error=${() => (this.error = "The clip could not be loaded")}
              ></video>`
            : nothing}
          ${this.error
            ? html`<div class="message">${this.error}</div>`
            : !this.playing
              ? html`<div class="spinner"></div>`
              : nothing}
        </div>
      </div>
    `;
  }

  static override styles = [
    tokens,
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
        width: min(1100px, 100%);
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
        max-height: calc(100vh - 120px);
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      .poster {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
      video {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .message {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--ch-text-secondary);
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
