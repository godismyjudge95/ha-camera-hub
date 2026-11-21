import { LitElement, css, html } from "lit";

import { getHubConfig } from "./api/ha";
import type { HomeAssistant, HubCamera, HubConfig } from "./ha-types";
import { tokens } from "./styles";
import "./ui/main-view";

declare const __CARD_VERSION__: string;

interface CardConfig {
  type: string;
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
  };

  declare hass: HomeAssistant;
  declare load: LoadState;
  private cardConfig: CardConfig = { type: "custom:camera-hub-card" };
  private loadStarted = false;

  constructor() {
    super();
    this.load = { state: "loading" };
  }

  setConfig(config: CardConfig): void {
    this.cardConfig = config;
  }

  getCardSize(): number {
    return 8;
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
    } catch (error) {
      const message = (error as { message?: string }).message ?? String(error);
      this.load = { state: "error", message };
    }
  }

  private mainCamera(config: HubConfig): HubCamera | undefined {
    const wanted = this.cardConfig.main_camera ?? config.default_camera;
    return config.cameras.find((camera) => camera.entity_id === wanted) ?? config.cameras[0];
  }

  override render() {
    if (this.load.state === "loading") return html`<div class="notice">Loading cameras…</div>`;
    if (this.load.state === "error") {
      return html`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;
    }
    return html`
      <div class="layout">
        <camera-hub-main-view
          .hass=${this.hass}
          .camera=${this.mainCamera(this.load.config)}
        ></camera-hub-main-view>
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
        background: var(--ch-bg);
        border-radius: var(--ch-radius-main);
        padding: var(--ch-gap);
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
