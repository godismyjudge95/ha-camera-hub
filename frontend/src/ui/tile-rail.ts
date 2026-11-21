import { LitElement, css, html } from "lit";

import { isCameraOffline, snapshotUrl } from "../api/snapshot";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { tokens } from "../styles";

const REFRESH_MS = 10_000;

// Small still images of every camera. A tap selects the camera for the main
// view. The images refresh only while the page is visible.
export class TileRail extends LitElement {
  static override properties = {
    hass: { attribute: false },
    cameras: { attribute: false },
    selected: { attribute: false },
    refresh: { state: true },
  };

  declare hass: HomeAssistant;
  declare cameras: HubCamera[];
  declare selected: string | undefined;
  declare refresh: number;

  private interval?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.cameras = [];
    this.refresh = Date.now();
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(this.interval);
    } else {
      this.refresh = Date.now();
      this.startRefreshing();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.startRefreshing();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    clearInterval(this.interval);
  }

  private startRefreshing(): void {
    clearInterval(this.interval);
    this.interval = setInterval(() => (this.refresh = Date.now()), REFRESH_MS);
  }

  private select(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("camera-select", { detail: entityId, bubbles: true, composed: true }),
    );
  }

  override render() {
    return html`
      <div class="rail">
        ${this.cameras.map((camera) => {
          const offline = isCameraOffline(this.hass, camera.entity_id);
          const image = offline ? undefined : snapshotUrl(this.hass, camera.entity_id, this.refresh);
          return html`
            <button
              class="tile ${camera.entity_id === this.selected ? "selected" : ""}"
              @click=${() => this.select(camera.entity_id)}
            >
              <span class="name">${camera.name}</span>
              <span class="image">
                ${image
                  ? html`<img src=${image} alt="" loading="lazy" />`
                  : html`<span class="offline">${offline ? "Offline" : ""}</span>`}
              </span>
            </button>
          `;
        })}
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .rail {
        display: grid;
        grid-template-columns: repeat(var(--ch-rail-columns, 2), minmax(0, 1fr));
        gap: var(--ch-gap);
      }
      .tile {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }
      .tile:active .image {
        transform: scale(0.97);
      }
      .name {
        padding: 0 2px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ch-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .selected .name {
        color: var(--ch-accent);
      }
      .image {
        position: relative;
        display: block;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-tile);
        overflow: hidden;
        background: var(--ch-surface-raised);
        outline: 2px solid transparent;
        outline-offset: 2px;
        transition:
          outline-color 150ms,
          transform 100ms;
      }
      .selected .image {
        outline-color: var(--ch-accent);
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .offline {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 12px;
        color: var(--ch-text-secondary);
      }
    `,
  ];
}

customElements.define("camera-hub-tile-rail", TileRail);
