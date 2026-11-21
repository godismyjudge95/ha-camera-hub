import { LitElement, css, html } from "lit";

import { getHubConfig } from "./api/ha";
import type { HomeAssistant, HubCamera, HubConfig } from "./ha-types";
import { IdleTimer } from "./idle";
import { tokens } from "./styles";
import "./ui/main-view";
import "./ui/tile-rail";

declare const __CARD_VERSION__: string;

interface CardConfig {
  type: string;
  // Overrides the integration's default camera for this card.
  main_camera?: string;
}

type LoadState =
  | { state: "loading" }
  | { state: "ready"; config: HubConfig }
  | { state: "error"; message: string };

export class CameraHubCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    load: { state: true },
    selected: { state: true },
  };

  declare hass: HomeAssistant;
  declare load: LoadState;
  // The camera in the main view.
  declare selected: string | undefined;

  private cardConfig: CardConfig = { type: "custom:camera-hub-card" };
  private loadStarted = false;
  private readonly idle = new IdleTimer(() => this.selectDefault());

  constructor() {
    super();
    this.load = { state: "loading" };
    // Any touch on the card counts as activity, also on controls that stop
    // the event from bubbling further.
    this.addEventListener("pointerdown", () => this.idle.restart(), { capture: true });
    this.addEventListener("camera-select", (event) => {
      this.selected = (event as CustomEvent<string>).detail;
    });
  }

  setConfig(config: CardConfig): void {
    this.cardConfig = config;
  }

  getCardSize(): number {
    return 8;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.idle.stop();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.load.state === "ready") this.idle.restart();
  }

  override updated(): void {
    if (this.hass && !this.loadStarted) {
      this.loadStarted = true;
      void this.loadConfig();
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const config = await getHubConfig(this.hass);
      if (config.version !== __CARD_VERSION__) {
        console.warn(
          `Camera Hub: the card is ${__CARD_VERSION__} but the integration is ${config.version}. Reload the page to get the new card.`,
        );
      }
      this.load = { state: "ready", config };
      this.selectDefault();
      this.idle.setTimeout(config.return_after_seconds);
    } catch (error) {
      const message = (error as { message?: string }).message ?? String(error);
      this.load = { state: "error", message };
    }
  }

  private defaultCamera(config: HubConfig): HubCamera | undefined {
    const wanted = this.cardConfig.main_camera ?? config.default_camera;
    return config.cameras.find((camera) => camera.entity_id === wanted) ?? config.cameras[0];
  }

  private selectDefault(): void {
    if (this.load.state === "ready") {
      this.selected = this.defaultCamera(this.load.config)?.entity_id;
    }
  }

  override render() {
    if (this.load.state === "loading") return html`<div class="notice">Loading cameras…</div>`;
    if (this.load.state === "error") {
      return html`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;
    }
    const { cameras } = this.load.config;
    const main = cameras.find((camera) => camera.entity_id === this.selected);
    return html`
      <div class="layout">
        <camera-hub-main-view .hass=${this.hass} .camera=${main}></camera-hub-main-view>
        <camera-hub-tile-rail
          .hass=${this.hass}
          .cameras=${cameras}
          .selected=${this.selected}
        ></camera-hub-tile-rail>
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
        container-type: inline-size;
        background: var(--ch-bg);
        border-radius: var(--ch-radius-main);
        padding: var(--ch-gap);
      }
      .layout {
        display: grid;
        gap: calc(var(--ch-gap) * 1.5) var(--ch-gap);
        grid-template-columns: minmax(0, 1fr);
        --ch-rail-columns: 3;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          align-items: start;
          --ch-rail-columns: 2;
        }
      }
      .notice {
        padding: 24px;
        color: var(--ch-text-secondary);
      }
    `,
  ];
}

customElements.define("camera-hub-card", CameraHubCard);

const registry = window as unknown as { customCards?: Array<Record<string, unknown>> };
registry.customCards ??= [];
registry.customCards.push({
  type: "camera-hub-card",
  name: "Camera Hub",
  description: "Live cameras, clips and alerts from Frigate.",
});

console.info(`Camera Hub card ${__CARD_VERSION__}`);
