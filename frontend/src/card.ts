import { LitElement, css, html, nothing } from "lit";

import { getHubConfig } from "./api/ha";
import type { HomeAssistant, HubCamera, HubConfig } from "./ha-types";
import { IdleTimer } from "./idle";
import type { Review } from "./reviews";
import { tokens } from "./styles";
import "./ui/clip-modal";
import "./ui/clips-strip";
import "./ui/main-view";
import "./ui/tile-rail";

declare const __CARD_VERSION__: string;

const SNAPSHOT_REFRESH_MS = 10_000;

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
    snapshotRefresh: { state: true },
    openClip: { state: true },
  };

  declare hass: HomeAssistant;
  declare load: LoadState;
  // The camera in the main view.
  declare selected: string | undefined;
  // Changes every SNAPSHOT_REFRESH_MS while the page is visible, so the
  // camera stills load again.
  declare snapshotRefresh: number;
  // The alert playing in the clip player.
  declare openClip: Review | undefined;

  private cardConfig: CardConfig = { type: "custom:camera-hub-card" };
  private loadStarted = false;
  private readonly idle = new IdleTimer(() => this.selectDefault());
  private snapshotTimer?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.load = { state: "loading" };
    this.snapshotRefresh = Date.now();
    // Any touch on the card counts as activity, also on controls that stop
    // the event from bubbling further.
    this.addEventListener("pointerdown", () => this.idle.restart(), { capture: true });
    this.addEventListener("camera-select", (event) => {
      this.selected = (event as CustomEvent<string>).detail;
    });
    this.addEventListener("clip-open", (event) => this.onClipOpen((event as CustomEvent<Review>).detail));
    this.addEventListener("clip-close", () => (this.openClip = undefined));
  }

  setConfig(config: CardConfig): void {
    this.cardConfig = config;
  }

  getCardSize(): number {
    return 8;
  }

  private readonly onVisibilityChange = () => {
    clearInterval(this.snapshotTimer);
    if (!document.hidden) this.refreshSnapshots();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.refreshSnapshots();
    if (this.load.state === "ready") this.idle.restart();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    clearInterval(this.snapshotTimer);
    this.idle.stop();
  }

  private refreshSnapshots(): void {
    this.snapshotRefresh = Date.now();
    clearInterval(this.snapshotTimer);
    this.snapshotTimer = setInterval(() => (this.snapshotRefresh = Date.now()), SNAPSHOT_REFRESH_MS);
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

  // An alert that is still going on has no clip yet: show it live instead.
  private onClipOpen(review: Review): void {
    if (review.end_time !== null) {
      this.openClip = review;
      return;
    }
    const camera = this.cameraByFrigateName(review.camera);
    if (camera) this.selected = camera.entity_id;
  }

  private cameraByFrigateName(name: string): HubCamera | undefined {
    if (this.load.state !== "ready") return undefined;
    return this.load.config.cameras.find((camera) => camera.frigate_name === name);
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
        <camera-hub-main-view
          .hass=${this.hass}
          .camera=${main}
          .snapshotRefresh=${this.snapshotRefresh}
        ></camera-hub-main-view>
        <camera-hub-tile-rail
          .hass=${this.hass}
          .cameras=${cameras}
          .selected=${this.selected}
          .refresh=${this.snapshotRefresh}
        ></camera-hub-tile-rail>
        <camera-hub-clips-strip .hass=${this.hass} .cameras=${cameras}></camera-hub-clips-strip>
      </div>
      ${this.openClip
        ? html`<camera-hub-clip-modal
            .hass=${this.hass}
            .review=${this.openClip}
            .instanceId=${cameras[0]?.instance_id ?? ""}
            .cameraName=${this.cameraByFrigateName(this.openClip.camera)?.name ?? this.openClip.camera}
          ></camera-hub-clip-modal>`
        : nothing}
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
        grid-template-areas: "main" "clips" "rail";
        --ch-rail-columns: 3;
      }
      camera-hub-main-view {
        grid-area: main;
      }
      camera-hub-clips-strip {
        grid-area: clips;
      }
      camera-hub-tile-rail {
        grid-area: rail;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view,
         and the alerts run under the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          grid-template-areas: "main rail" "clips rail";
          grid-template-rows: auto 1fr;
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
