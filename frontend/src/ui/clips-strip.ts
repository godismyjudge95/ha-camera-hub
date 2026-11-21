import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { signedUrls } from "../api/signed-urls";
import type { HomeAssistant, HubCamera } from "../ha-types";
import type { ReviewStore } from "../review-store";
import {
  type Review,
  type ReviewFilter,
  groupByDay,
  relativeTime,
  reviewDuration,
  reviewLabel,
  reviewMatches,
  thumbnailPath,
} from "../reviews";
import { tokens } from "../styles";

const FILTERS: Array<{ id: ReviewFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "person", label: "People" },
  { id: "animal", label: "Animals" },
  { id: "vehicle", label: "Vehicles" },
];

// Recent Frigate alerts from the hub's cameras, newest first.
export class ClipsStrip extends LitElement {
  static override properties = {
    hass: { attribute: false },
    cameras: { attribute: false },
    store: { attribute: false },
    filter: { state: true },
    thumbnails: { state: true },
    now: { state: true },
    revision: { state: true },
    layout: { attribute: false },
  };

  declare hass: HomeAssistant;
  declare cameras: HubCamera[];
  declare store: ReviewStore;
  declare filter: ReviewFilter;
  declare thumbnails: Record<string, string>;
  declare now: number;
  // Changes when the store changes, so the list renders again.
  declare revision: number;
  // "row": one row of thumbnails that scrolls sideways (tablet).
  // "list": a vertical list grouped by day (phone).
  declare layout: "row" | "list";

  private clock?: ReturnType<typeof setInterval>;
  private stopListening?: () => void;

  constructor() {
    super();
    this.cameras = [];
    this.filter = "all";
    this.thumbnails = {};
    this.now = Date.now();
    this.revision = 0;
    this.layout = "row";
  }

  private get instanceId(): string | undefined {
    return this.cameras[0]?.instance_id;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clock = setInterval(() => (this.now = Date.now()), 30_000);
    this.listen();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clock);
    this.stopListening?.();
    this.stopListening = undefined;
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("store")) this.listen();
  }

  private listen(): void {
    if (!this.store || this.stopListening) return;
    this.stopListening = this.store.onChange(() => {
      this.revision++;
      this.signThumbnails();
    });
    this.signThumbnails();
  }

  private signThumbnails(): void {
    const instanceId = this.instanceId;
    if (!instanceId || !this.hass) return;
    for (const review of this.store.reviews) {
      if (this.thumbnails[review.id]) continue;
      void signedUrls.get(this.hass, thumbnailPath(instanceId, review)).then(
        (url) => (this.thumbnails = { ...this.thumbnails, [review.id]: url }),
        () => undefined,
      );
    }
  }

  private open(review: Review): void {
    this.dispatchEvent(new CustomEvent("clip-open", { detail: review, bubbles: true, composed: true }));
  }

  private cameraName(frigateName: string): string {
    return this.cameras.find((camera) => camera.frigate_name === frigateName)?.name ?? frigateName;
  }

  override render() {
    const reviews = this.store?.reviews ?? [];
    const visible = reviews.filter((review) => reviewMatches(review, this.filter));
    return html`
      <div class="header ${this.layout === "list" ? "wrap" : ""}">
        ${this.layout === "row" ? html`<span class="title">Recent alerts</span>` : nothing}
        <div class="chips">
          ${FILTERS.map(
            (filter) => html`
              <button
                class="chip ${this.filter === filter.id ? "on" : ""}"
                @click=${() => (this.filter = filter.id)}
              >
                ${filter.label}
              </button>
            `,
          )}
        </div>
      </div>
      ${this.store?.error
        ? html`<div class="empty">Alerts are not available: ${this.store.error}</div>`
        : visible.length === 0
          ? html`<div class="empty">No alerts in the last ${this.store?.hours ?? 24} hours.</div>`
          : this.layout === "list"
            ? this.renderList(visible)
            : html`
                <div class="scroller">
                  ${visible.map((review) => this.renderClip(review))}
                </div>
              `}
    `;
  }

  private renderList(reviews: Review[]) {
    return groupByDay(reviews, this.now).map(
      (day) => html`
        <div class="day">${day.label}</div>
        ${day.reviews.map((review) => {
          const thumbnail = this.thumbnails[review.id];
          const time = new Date(review.start_time * 1000).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });
          const duration = reviewDuration(review);
          return html`
            <button class="row" @click=${() => this.open(review)}>
              <span class="thumb">
                ${thumbnail ? html`<img src=${thumbnail} alt="" loading="lazy" />` : nothing}
                ${duration === undefined
                  ? html`<span class="now"><span class="dot"></span>Now</span>`
                  : nothing}
              </span>
              <span class="text">
                <span class="row-label">${reviewLabel(review)}</span>
                <span class="row-meta">${this.cameraName(review.camera)}</span>
                <span class="row-meta">${time}${duration ? ` · ${duration}` : ""}</span>
              </span>
              <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
            </button>
          `;
        })}
      `,
    );
  }

  private renderClip(review: Review) {
    const thumbnail = this.thumbnails[review.id];
    const ongoing = review.end_time === null;
    return html`
      <button class="clip" @click=${() => this.open(review)}>
        ${thumbnail ? html`<img src=${thumbnail} alt="" loading="lazy" />` : nothing}
        <span class="shade"></span>
        ${ongoing ? html`<span class="now"><span class="dot"></span>Now</span>` : nothing}
        <span class="caption">
          <span class="label">${reviewLabel(review)}</span>
          <span class="meta">
            ${this.cameraName(review.camera)} · ${relativeTime(review.start_time, this.now)}
          </span>
        </span>
      </button>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .title {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ch-text-secondary);
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .chip {
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text-secondary);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        touch-action: manipulation;
      }
      .chip.on {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      .scroller {
        display: flex;
        gap: var(--ch-gap);
        overflow-x: auto;
        scroll-snap-type: x proximity;
        scrollbar-width: none;
        padding-bottom: 2px;
      }
      .clip {
        position: relative;
        flex: 0 0 176px;
        aspect-ratio: 16 / 9;
        padding: 0;
        border: 0;
        border-radius: var(--ch-radius-thumb);
        overflow: hidden;
        background: var(--ch-surface-raised);
        color: inherit;
        font: inherit;
        text-align: left;
        scroll-snap-align: start;
        cursor: pointer;
        touch-action: manipulation;
      }
      .clip:active {
        transform: scale(0.97);
      }
      .clip img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .shade {
        position: absolute;
        inset: auto 0 0 0;
        height: 60%;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
      }
      .caption {
        position: absolute;
        inset: auto 8px 6px 8px;
        display: flex;
        flex-direction: column;
      }
      .label {
        font-size: 13px;
        font-weight: 700;
      }
      .meta {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.75);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .now {
        position: absolute;
        top: 6px;
        left: 6px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.6);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .now .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ch-red);
      }
      .empty {
        padding: 18px 4px;
        font-size: 14px;
        color: var(--ch-text-secondary);
      }
      .day {
        margin: 14px 4px 6px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ch-text-secondary);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 84px;
        padding: 6px;
        border: 0;
        border-radius: var(--ch-radius-tile);
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }
      .row:active {
        background: var(--ch-surface);
      }
      .thumb {
        position: relative;
        flex: none;
        width: 128px;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-thumb);
        overflow: hidden;
        background: var(--ch-surface-raised);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .row-label {
        font-size: 16px;
        font-weight: 600;
      }
      .row-meta {
        font-size: 13px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chevron {
        flex: none;
        color: var(--ch-text-secondary);
      }
      .header.wrap .chips {
        flex-wrap: wrap;
      }
    `,
  ];
}

customElements.define("camera-hub-clips-strip", ClipsStrip);
