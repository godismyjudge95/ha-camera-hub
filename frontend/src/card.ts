import { LitElement, type TemplateResult, css, html, nothing } from "lit";

import { getHubConfig } from "./api/ha";
import type { HomeAssistant, HubCamera, HubConfig } from "./ha-types";
import { IdleTimer } from "./idle";
import { ReviewStore } from "./review-store";
import type { Review } from "./reviews";
import { tokens } from "./styles";
import "./ui/clip-modal";
import "./ui/clips-strip";
import "./ui/doorbell-overlay";
import type { MainView } from "./ui/main-view";
import "./ui/main-view";
import "./ui/pause-bar";
import "./ui/tile-rail";
import "./ui/vertical-timeline";
import { errorMessage } from "./errors";

declare const __CARD_VERSION__: string;

const SNAPSHOT_REFRESH_MS = 10_000;
// Below this width the card uses the phone layout.
const PHONE_MAX_WIDTH = 700;

type PhoneTab = "cameras" | "alerts" | "timeline" | "pause";
// An always-on screen keeps its picture still for hours. Moving the layout by
// a pixel or two now and then spreads the wear of static edges and text.
const SHIFT_MS = 2 * 60_000;

interface CardConfig {
  type: string;
  // Overrides the integration's default camera for this card.
  main_camera?: string;
}

type LoadState =
  | { state: "loading" }
  | { state: "ready"; config: HubConfig }
  | { state: "error"; message: string };

// After an update, a browser or app can still run the old card from its
// cache. A reload fetches the page that loads the new card. It runs at most
// once per version, so a cache that keeps the old card cannot cause a loop.
function reloadForNewVersion(version: string): boolean {
  const key = `camera-hub-reloaded-for-${version}`;
  try {
    if (sessionStorage.getItem(key)) {
      console.warn(`Camera Hub: the card is ${__CARD_VERSION__}, the integration is ${version}.`);
      return false;
    }
    sessionStorage.setItem(key, "1");
  } catch {
    return false;
  }
  location.reload();
  return true;
}

export class CameraHubCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    load: { state: true },
    selected: { state: true },
    snapshotRefresh: { state: true },
    openClip: { state: true },
    reviewsRevision: { state: true },
    shift: { state: true },
    phone: { state: true },
    tab: { state: true },
    timelineOpen: { state: true },
    playbackPosition: { state: true },
    pinned: { state: true },
  };

  declare hass: HomeAssistant;
  declare load: LoadState;
  // The user pinned the camera on screen: no return to the default camera
  // until they unpin it. It lasts until the page reloads.
  declare pinned: boolean;
  // The camera in the main view.
  declare selected: string | undefined;
  // Changes every SNAPSHOT_REFRESH_MS while the page is visible, so the
  // camera stills load again.
  declare snapshotRefresh: number;
  // The alert playing in the clip player.
  declare openClip: Review | undefined;
  // Changes when the alert list changes, so the card renders again.
  declare reviewsRevision: number;
  declare shift: [number, number];
  // The card is narrow, as on a phone: one column with tabs.
  declare phone: boolean;
  declare tab: PhoneTab;
  // On a tablet the timeline replaces the camera tiles while it is open.
  declare timelineOpen: boolean;
  // The time the main view plays, or null when it is live.
  declare playbackPosition: number | null;

  private cardConfig: CardConfig = { type: "custom:camera-hub-card" };
  private loadStarted = false;
  private readonly idle = new IdleTimer(() => this.selectDefault());
  private snapshotTimer?: ReturnType<typeof setInterval>;
  private shiftTimer?: ReturnType<typeof setInterval>;
  private readonly reviewStore = new ReviewStore();
  private readonly resizeObserver = new ResizeObserver(([entry]) => {
    this.phone = entry.contentRect.width < PHONE_MAX_WIDTH;
  });

  constructor() {
    super();
    this.load = { state: "loading" };
    this.pinned = false;
    this.snapshotRefresh = Date.now();
    this.reviewsRevision = 0;
    this.shift = [0, 0];
    this.phone = false;
    this.tab = "cameras";
    this.timelineOpen = false;
    this.playbackPosition = null;
    this.reviewStore.onChange(() => this.reviewsRevision++);
    // Any touch on the card counts as activity, also on controls that stop
    // the event from bubbling further.
    this.addEventListener("pointerdown", () => this.idle.restart(), { capture: true });
    this.addEventListener("pin-toggle", () => {
      this.pinned = !this.pinned;
      this.idle.hold(this.pinned);
    });
    this.addEventListener("camera-select", (event) => {
      this.selected = (event as CustomEvent<string>).detail;
    });
    this.addEventListener("clip-open", (event) => this.onClipOpen((event as CustomEvent<Review>).detail));
    this.addEventListener("clip-close", () => (this.openClip = undefined));
    this.addEventListener("timeline-toggle", () => {
      if (this.phone) this.tab = this.tab === "timeline" ? "cameras" : "timeline";
      else this.timelineOpen = !this.timelineOpen;
    });
    this.addEventListener("playback-position", (event) => {
      this.playbackPosition = (event as CustomEvent<number | null>).detail;
    });
    this.addEventListener("timeline-seek", (event) => {
      const time = (event as CustomEvent<number | null>).detail;
      const main = this.renderRoot.querySelector<MainView>("camera-hub-main-view");
      if (time === null) main?.goLive();
      else main?.playRecording(time);
    });
    this.addEventListener("timeline-scrub", (event) => {
      const main = this.renderRoot.querySelector<MainView>("camera-hub-main-view");
      main?.previewRecording((event as CustomEvent<number>).detail);
    });
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
    this.resizeObserver.observe(this);
    this.refreshSnapshots();
    if (this.load.state === "ready") this.idle.restart();
    this.shiftTimer = setInterval(() => {
      const step = () => Math.round(Math.random() * 4) - 2;
      this.shift = [step(), step()];
    }, SHIFT_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    clearInterval(this.snapshotTimer);
    clearInterval(this.shiftTimer);
    this.resizeObserver.disconnect();
    this.idle.stop();
    this.reviewStore.stop();
    this.loadStarted = false;
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
      if (config.version !== __CARD_VERSION__ && reloadForNewVersion(config.version)) return;
      this.load = { state: "ready", config };
      const instanceId = config.cameras[0]?.instance_id;
      if (instanceId) {
        this.reviewStore.start(
          this.hass,
          instanceId,
          config.cameras.map((camera) => camera.frigate_name),
        );
      }
      this.selectDefault();
      this.idle.setTimeout(config.return_after_seconds);
    } catch (error) {
      const message = errorMessage(error);
      this.load = { state: "error", message };
    }
  }

  private defaultCamera(config: HubConfig): HubCamera | undefined {
    const wanted = this.cardConfig.main_camera ?? config.default_camera;
    return config.cameras.find((camera) => camera.entity_id === wanted) ?? config.cameras[0];
  }

  // An alert that is still going on has no clip yet: show it live instead.
  // On a phone a clip plays in the main view, which stays on screen above the
  // list; on a larger screen it opens in its own player.
  private async onClipOpen(review: Review): Promise<void> {
    const camera = this.cameraByFrigateName(review.camera);
    if (review.end_time === null || (this.phone && camera)) {
      if (camera) this.selected = camera.entity_id;
      if (review.end_time === null || !camera) return;
      await this.updateComplete;
      const main = this.renderRoot.querySelector<MainView>("camera-hub-main-view");
      await main?.updateComplete;
      main?.playRecording(review.start_time - 2);
      return;
    }
    this.openClip = review;
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
    const { cameras, doorbell } = this.load.config;
    const ringing =
      doorbell?.camera && doorbell.active_entity
        ? this.hass.states[doorbell.active_entity]?.state === "on"
        : false;
    const main = cameras.find((camera) => camera.entity_id === this.selected);
    const alerting = new Set(
      this.reviewStore.reviews
        .filter((review) => review.end_time === null)
        .map((review) => review.camera),
    );
    const mainView = html`<camera-hub-main-view
      .hass=${this.hass}
      .camera=${main}
      .snapshotRefresh=${this.snapshotRefresh}
      .timelineOpen=${this.phone ? this.tab === "timeline" : this.timelineOpen}
      .pinnable=${this.load.config.return_after_seconds > 0}
      .pinned=${this.pinned}
    ></camera-hub-main-view>`;
    const tiles = html`<camera-hub-tile-rail
      .hass=${this.hass}
      .cameras=${cameras}
      .selected=${this.selected}
      .refresh=${this.snapshotRefresh}
      .alerting=${alerting}
    ></camera-hub-tile-rail>`;
    const timeline = main
      ? html`<camera-hub-vertical-timeline
          .hass=${this.hass}
          .camera=${main}
          .position=${this.playbackPosition}
        ></camera-hub-vertical-timeline>`
      : nothing;
    const layout = this.phone ? "list" : "row";
    const pause = html`<camera-hub-pause-bar
      .hass=${this.hass}
      .zones=${this.load.config.zones ?? []}
      .layout=${layout}
    ></camera-hub-pause-bar>`;
    const alerts = html`<camera-hub-clips-strip
      .hass=${this.hass}
      .cameras=${cameras}
      .store=${this.reviewStore}
      .layout=${layout}
    ></camera-hub-clips-strip>`;
    return html`
      ${this.phone
        ? this.renderPhone(mainView, tiles, alerts, timeline, pause, alerting.size > 0)
        : html`<div class="layout" style="translate: ${this.shift[0]}px ${this.shift[1]}px">
            ${mainView}
            ${this.timelineOpen
              ? html`<div class="side-timeline">
                  <div class="side-head">
                    <span>Timeline · ${main?.name ?? ""}</span>
                    <button @click=${() => (this.timelineOpen = false)}>
                      <ha-icon icon="mdi:view-grid-outline"></ha-icon>Cameras
                    </button>
                  </div>
                  ${timeline}
                </div>`
              : tiles}
            ${pause}${alerts}
          </div>`}
      ${this.openClip
        ? html`<camera-hub-clip-modal
            .hass=${this.hass}
            .review=${this.openClip}
            .instanceId=${cameras[0]?.instance_id ?? ""}
            .cameraName=${this.cameraByFrigateName(this.openClip.camera)?.name ?? this.openClip.camera}
          ></camera-hub-clip-modal>`
        : nothing}
      ${ringing && doorbell?.camera && doorbell.active_entity
        ? html`<camera-hub-doorbell-overlay
            .hass=${this.hass}
            .camera=${doorbell.camera}
            .activeEntity=${doorbell.active_entity}
          ></camera-hub-doorbell-overlay>`
        : nothing}
    `;
  }

  private renderPhone(
    mainView: TemplateResult,
    tiles: TemplateResult,
    alerts: TemplateResult,
    timeline: TemplateResult | typeof nothing,
    pause: TemplateResult,
    alerting: boolean,
  ) {
    const zones = this.load.state === "ready" ? (this.load.config.zones ?? []) : [];
    const paused = zones.some(
      (zone) => zone.notify && zone.switch_entity && this.hass.states[zone.switch_entity]?.state === "off",
    );
    const notifyZones = zones.some((zone) => zone.notify);
    const tabs: Array<{ id: PhoneTab; label: string; dot?: string }> = [
      { id: "cameras", label: "Cameras" },
      { id: "alerts", label: "Alerts", dot: alerting ? "red" : undefined },
      { id: "timeline", label: "Timeline" },
      ...(notifyZones ? [{ id: "pause" as const, label: "Pause", dot: paused ? "amber" : undefined }] : []),
    ];
    return html`
      <div class="phone">
        <div class="sticky">${mainView}</div>
        <div class="tabs" role="tablist">
          ${tabs.map(
            (tab) => html`<button
              role="tab"
              aria-selected=${this.tab === tab.id}
              class="tab ${this.tab === tab.id ? "on" : ""}"
              @click=${() => (this.tab = tab.id)}
            >
              ${tab.label}${tab.dot ? html`<span class="tab-dot ${tab.dot}"></span>` : nothing}
            </button>`,
          )}
        </div>
        <div class="panel">
          ${this.tab === "alerts"
            ? alerts
            : this.tab === "timeline"
              ? timeline
              : this.tab === "pause" && notifyZones
                ? pause
                : tiles}
        </div>
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
        transition: translate 2s ease;
        display: grid;
        gap: calc(var(--ch-gap) * 1.5) var(--ch-gap);
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: "main" "pause" "clips" "rail";
        --ch-rail-columns: 3;
      }
      camera-hub-main-view {
        grid-area: main;
      }
      camera-hub-clips-strip {
        grid-area: clips;
      }
      camera-hub-pause-bar {
        grid-area: pause;
        min-width: 0;
      }
      camera-hub-tile-rail,
      .side-timeline {
        grid-area: rail;
      }
      .side-timeline {
        display: flex;
        flex-direction: column;
        gap: 10px;
        --ch-timeline-height: 600px;
      }
      .side-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 600;
        color: var(--ch-text-secondary);
      }
      .side-head button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        padding: 0 12px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        --mdc-icon-size: 18px;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view,
         and the alerts run under the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          grid-template-areas: "main rail" "pause rail" "clips rail";
          grid-template-rows: auto auto 1fr;
          align-items: start;
          --ch-rail-columns: 2;
        }
      }
      /* Phone: the video stays at the top while the tab below it scrolls. */
      .phone {
        --ch-rail-columns: 2;
        /* The timeline fills the screen under the video and the tabs. */
        --ch-timeline-height: max(320px, calc(100dvh - var(--header-height, 56px) - 400px));
      }
      .sticky {
        position: sticky;
        top: var(--header-height, 56px);
        z-index: 2;
        margin: calc(var(--ch-gap) * -1) calc(var(--ch-gap) * -1) 0;
        padding: var(--ch-gap) var(--ch-gap) 0;
        background: var(--ch-bg);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 12px 0;
        padding: 4px;
        border-radius: 999px;
        background: var(--ch-surface);
      }
      .tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 44px;
        border: 0;
        border-radius: 999px;
        background: none;
        color: var(--ch-text-secondary);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        touch-action: manipulation;
      }
      .tab.on {
        background: var(--ch-surface-raised);
        color: var(--ch-text);
      }
      .tab-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .tab-dot.red {
        background: var(--ch-red);
      }
      .tab-dot.amber {
        background: var(--ch-amber);
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
