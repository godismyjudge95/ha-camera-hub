import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { getReviews, subscribeReviews } from "../api/frigate";
import { signedUrls } from "../api/signed-urls";
import type { HomeAssistant, HubCamera } from "../ha-types";
import {
  type Review,
  type ReviewFilter,
  relativeTime,
  reviewLabel,
  reviewMatches,
  thumbnailPath,
  upsertReview,
} from "../reviews";
import { tokens } from "../styles";

const HOURS = 24;
const LIMIT = 40;

const FILTERS: Array<{ id: ReviewFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "person", label: "People" },
  { id: "animal", label: "Animals" },
  { id: "vehicle", label: "Vehicles" },
];

// Recent Frigate alerts from the hub's cameras, newest first. It loads the
// last day once and then follows Frigate's review messages.
export class ClipsStrip extends LitElement {
  static override properties = {
    hass: { attribute: false },
    cameras: { attribute: false },
    reviews: { state: true },
    filter: { state: true },
    thumbnails: { state: true },
    now: { state: true },
    error: { state: true },
  };

  declare hass: HomeAssistant;
  declare cameras: HubCamera[];
  declare reviews: Review[];
  declare filter: ReviewFilter;
  declare thumbnails: Record<string, string>;
  declare now: number;
  declare error: string | undefined;

  private unsubscribe?: Promise<() => Promise<void>>;
  private clock?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.cameras = [];
    this.reviews = [];
    this.filter = "all";
    this.thumbnails = {};
    this.now = Date.now();
  }

  private get instanceId(): string | undefined {
    return this.cameras[0]?.instance_id;
  }

  private get cameraNames(): Set<string> {
    return new Set(this.cameras.map((camera) => camera.frigate_name));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clock = setInterval(() => (this.now = Date.now()), 30_000);
    if (this.hass && this.cameras.length) void this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clock);
    void this.unsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => undefined);
    this.unsubscribe = undefined;
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("cameras") && this.hass && this.cameras.length && !this.unsubscribe) {
      void this.load();
    }
  }

  private async load(): Promise<void> {
    const instanceId = this.instanceId;
    if (!instanceId || this.unsubscribe) return;
    // Subscribe first, so no review that starts during the load is missed.
    this.unsubscribe = subscribeReviews(this.hass, instanceId, (message) => {
      if (message.after.severity !== "alert" || !this.cameraNames.has(message.after.camera)) return;
      this.reviews = upsertReview(this.reviews, message.after, LIMIT);
      this.signThumbnail(message.after);
    });
    try {
      const after = Math.floor(Date.now() / 1000) - HOURS * 3600;
      const loaded = await getReviews(this.hass, instanceId, [...this.cameraNames], after, LIMIT);
      let reviews = this.reviews;
      for (const review of loaded) reviews = upsertReview(reviews, review, LIMIT);
      this.reviews = reviews;
      for (const review of reviews) this.signThumbnail(review);
      this.error = undefined;
    } catch (error) {
      this.error = (error as { message?: string }).message ?? String(error);
    }
  }

  private signThumbnail(review: Review): void {
    const instanceId = this.instanceId;
    if (!instanceId) return;
    void signedUrls.get(this.hass, thumbnailPath(instanceId, review)).then(
      (url) => (this.thumbnails = { ...this.thumbnails, [review.id]: url }),
      () => undefined,
    );
  }

  private open(review: Review): void {
    this.dispatchEvent(new CustomEvent("clip-open", { detail: review, bubbles: true, composed: true }));
  }

  private cameraName(frigateName: string): string {
    return this.cameras.find((camera) => camera.frigate_name === frigateName)?.name ?? frigateName;
  }

  override render() {
    const visible = this.reviews.filter((review) => reviewMatches(review, this.filter));
    return html`
      <div class="header">
        <span class="title">Recent alerts</span>
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
      ${this.error
        ? html`<div class="empty">Alerts are not available: ${this.error}</div>`
        : visible.length === 0
          ? html`<div class="empty">No alerts in the last ${HOURS} hours.</div>`
          : html`
              <div class="scroller">
                ${visible.map((review) => this.renderClip(review))}
              </div>
            `}
    `;
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
    `,
  ];
}

customElements.define("camera-hub-clips-strip", ClipsStrip);
