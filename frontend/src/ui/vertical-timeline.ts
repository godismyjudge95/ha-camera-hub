import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { getCameraReviews, getRecordingsSummary } from "../api/frigate";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { type Review, reviewLabel } from "../reviews";
import { tokens } from "../styles";
import {
  type RecordingDay,
  type Scale,
  hoursBetween,
  localDay,
  localTime,
  offsetOf,
  parseRecordingSummary,
  recordedRanges,
  timeAt,
} from "../timeline-math";

// The play position line, measured from the top of the timeline.
const PLAYHEAD = 64;
const ZOOMS = [30, 60, 120, 240, 480];
const DEFAULT_ZOOM = 120;
// After a scroll stops, the timeline waits this long before it seeks.
const SEEK_DELAY_MS = 400;
// A user who touches or scrolls the timeline keeps it from following the
// playing video for this long.
const HOLD_MS = 2500;
// Times this close to now count as live.
const LIVE_SECONDS = 20;
// Extra pixels drawn above and below the visible part.
const OVERSCAN = 800;

// A vertical timeline of one camera's recordings, newest at the top, as far
// back as Frigate has recordings. Scrolling it under the play position line
// picks a time; after the scroll stops it reports that time in a
// `timeline-seek` event (epoch seconds, or null for live). While nobody
// touches it, it follows the playing position.
export class VerticalTimeline extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    position: { attribute: false },
    days: { state: true },
    reviews: { state: true },
    pixelsPerHour: { state: true },
    now: { state: true },
    view: { state: true },
    label: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera;
  // The time playing, or null when the camera is live.
  declare position: number | null;
  declare days: RecordingDay[];
  // Reviews by local day, loaded as days come into view.
  declare reviews: Map<string, Review[]>;
  declare pixelsPerHour: number;
  declare now: number;
  // The visible part, as offsets from the top.
  declare view: [number, number];
  // The time under the play position line while the user scrolls.
  declare label: number | null;

  private readonly loadingDays = new Set<string>();
  private holdUntil = 0;
  private seekTimer?: ReturnType<typeof setTimeout>;
  private clockTimer?: ReturnType<typeof setInterval>;
  private ignoreScroll = false;

  constructor() {
    super();
    this.position = null;
    this.days = [];
    this.reviews = new Map();
    this.pixelsPerHour = DEFAULT_ZOOM;
    this.now = Date.now() / 1000;
    this.view = [0, 2000];
    this.label = null;
  }

  private get viewport(): HTMLElement | null {
    return this.renderRoot.querySelector(".viewport");
  }

  private get scale(): Scale {
    return { top: this.now, pixelsPerHour: this.pixelsPerHour };
  }

  private get oldest(): number {
    const last = this.days.at(-1);
    return last ? localTime(last.day) : this.now - 86_400;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clockTimer = setInterval(() => (this.now = Date.now() / 1000), 30_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clockTimer);
    clearTimeout(this.seekTimer);
  }

  override willUpdate(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous?.entity_id !== this.camera?.entity_id) {
      this.days = [];
      this.reviews = new Map();
      this.loadingDays.clear();
      void this.loadSummary();
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("position") || changed.has("days") || changed.has("pixelsPerHour")) {
      this.follow();
    }
    if (changed.has("view") || changed.has("days")) this.loadVisibleReviews();
  }

  override firstUpdated(): void {
    this.updateView();
  }

  private async loadSummary(): Promise<void> {
    const camera = this.camera;
    try {
      const days = parseRecordingSummary(
        await getRecordingsSummary(this.hass, camera.instance_id, camera.frigate_name),
      );
      if (camera === this.camera) this.days = days;
    } catch {
      this.days = [];
    }
  }

  private loadVisibleReviews(): void {
    const camera = this.camera;
    if (!camera) return;
    const newest = timeAt(this.scale, Math.max(0, this.view[0] - PLAYHEAD));
    const oldest = timeAt(this.scale, this.view[1]);
    for (let time = newest; time >= oldest - 86_400; time -= 86_400) {
      const day = localDay(time);
      if (this.reviews.has(day) || this.loadingDays.has(day)) continue;
      this.loadingDays.add(day);
      const start = localTime(day);
      getCameraReviews(this.hass, camera.instance_id, camera.frigate_name, start, start + 86_400).then(
        (reviews) => {
          if (camera !== this.camera) return;
          this.reviews = new Map(this.reviews).set(day, reviews);
        },
        () => this.loadingDays.delete(day),
      );
    }
  }

  // Keeps the playing time under the play position line, unless the user
  // is moving the timeline.
  private follow(): void {
    const viewport = this.viewport;
    if (!viewport || Date.now() < this.holdUntil) return;
    const target = this.position === null ? 0 : offsetOf(this.scale, this.position);
    if (Math.abs(viewport.scrollTop - target) < 1) return;
    this.ignoreScroll = true;
    viewport.scrollTop = target;
    requestAnimationFrame(() => (this.ignoreScroll = false));
    this.updateView();
  }

  private updateView(): void {
    const viewport = this.viewport;
    if (!viewport) return;
    const from = viewport.scrollTop - OVERSCAN;
    const to = viewport.scrollTop + viewport.clientHeight + OVERSCAN;
    if (Math.abs(from - this.view[0]) > OVERSCAN / 2 || Math.abs(to - this.view[1]) > OVERSCAN / 2) {
      this.view = [from, to];
    }
  }

  private onScroll(): void {
    this.updateView();
    if (this.ignoreScroll) return;
    this.holdUntil = Date.now() + HOLD_MS;
    const time = timeAt(this.scale, this.viewport!.scrollTop);
    this.label = time;
    clearTimeout(this.seekTimer);
    this.seekTimer = setTimeout(() => this.seek(time), SEEK_DELAY_MS);
  }

  private seek(time: number): void {
    this.label = null;
    const live = time >= Date.now() / 1000 - LIVE_SECONDS;
    this.dispatchEvent(
      new CustomEvent("timeline-seek", {
        detail: live ? null : Math.max(time, this.oldest),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private jumpTo(time: number): void {
    const viewport = this.viewport;
    if (!viewport) return;
    this.ignoreScroll = true;
    viewport.scrollTop = offsetOf(this.scale, time);
    requestAnimationFrame(() => (this.ignoreScroll = false));
    this.holdUntil = Date.now() + HOLD_MS;
    this.updateView();
    this.seek(time);
  }

  private jumpToDay(day: RecordingDay): void {
    const latest = day.hours.length ? localTime(day.day, day.hours.at(-1)! + 1) : localTime(day.day) + 86_399;
    this.jumpTo(Math.min(latest - 60, this.now));
  }

  private zoom(step: number): void {
    const index = ZOOMS.indexOf(this.pixelsPerHour);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, index + step))];
    if (next === this.pixelsPerHour) return;
    const viewport = this.viewport;
    const time = viewport ? timeAt(this.scale, viewport.scrollTop) : this.now;
    this.pixelsPerHour = next;
    void this.updateComplete.then(() => {
      if (!this.viewport) return;
      this.ignoreScroll = true;
      this.viewport.scrollTop = offsetOf(this.scale, time);
      requestAnimationFrame(() => (this.ignoreScroll = false));
      this.updateView();
    });
  }

  private dayLabel(day: string): string {
    if (day === localDay(this.now)) return "Today";
    if (day === localDay(this.now - 86_400)) return "Yesterday";
    return new Date(localTime(day) * 1000).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  private clock(time: number, seconds = false): string {
    return new Date(time * 1000).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" } : {}),
    });
  }

  override render() {
    const scale = this.scale;
    const [from, to] = this.view;
    const visibleNewest = timeAt(scale, Math.max(0, from - PLAYHEAD));
    const visibleOldest = timeAt(scale, to);
    const y = (time: number) => PLAYHEAD + offsetOf(scale, time);
    const height = y(this.oldest) + 600;
    const shown = this.label ?? this.position;
    const currentDay = localDay(shown ?? this.now);

    const ranges = recordedRanges(this.days).filter(
      ([start, end]) => end >= visibleOldest && start <= visibleNewest,
    );
    const hours = hoursBetween(Math.min(visibleNewest, this.now), Math.max(visibleOldest, this.oldest));
    const reviews = [...this.reviews.values()]
      .flat()
      .filter((review) => (review.end_time ?? this.now) >= visibleOldest && review.start_time <= visibleNewest);

    return html`
      <div class="bar">
        <div class="days">
          ${this.days.map(
            (day) => html`<button
              class="day ${day.day === currentDay ? "on" : ""}"
              @click=${() => this.jumpToDay(day)}
            >
              ${this.dayLabel(day.day)}
            </button>`,
          )}
        </div>
        <div class="zoom">
          <button aria-label="Zoom out" @click=${() => this.zoom(-1)}>
            <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          </button>
          <button aria-label="Zoom in" @click=${() => this.zoom(1)}>
            <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
          </button>
        </div>
      </div>
      <div class="box">
        <div
          class="viewport"
          @scroll=${this.onScroll}
          @pointerdown=${() => (this.holdUntil = Date.now() + HOLD_MS)}
        >
          <div class="content" style="height: ${height}px">
            ${ranges.map(
              ([start, end]) =>
                html`<div
                  class="recorded"
                  style="top: ${y(Math.min(end, this.now))}px; height: ${offsetOf(
                    scale,
                    start,
                  ) - offsetOf(scale, Math.min(end, this.now))}px"
                ></div>`,
            )}
            ${hours.map((hour) => {
              const midnight = new Date(hour * 1000).getHours() === 0;
              return html`<div class="hour ${midnight ? "midnight" : ""}" style="top: ${y(hour)}px">
                <span>${midnight ? this.dayLabel(localDay(hour)) : this.clock(hour)}</span>
              </div>`;
            })}
            ${reviews.map((review) => {
              const end = review.end_time ?? this.now;
              const top = y(end);
              const size = Math.max(6, offsetOf(scale, review.start_time) - offsetOf(scale, end));
              return html`<button
                class="mark ${review.severity}"
                style="top: ${top}px; height: ${size}px"
                title=${`${reviewLabel(review)} · ${this.clock(review.start_time)}`}
                @click=${() => this.jumpTo(review.start_time - 2)}
              ></button>`;
            })}
          </div>
        </div>
        <div class="playhead" style="top: ${PLAYHEAD}px">
          <span class="pill ${shown === null ? "live" : ""}">
            ${shown === null ? "Live" : `${this.dayLabel(localDay(shown))} · ${this.clock(shown, true)}`}
          </span>
        </div>
        ${this.days.length === 0 ? html`<div class="empty">Loading recordings…</div>` : nothing}
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: var(--ch-timeline-height, 560px);
        min-height: 280px;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .days {
        flex: 1;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .day,
      .zoom button {
        flex: none;
        min-height: 40px;
        padding: 0 12px;
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
      .day.on {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      .zoom {
        display: flex;
        gap: 6px;
      }
      .zoom button {
        display: grid;
        place-items: center;
        width: 40px;
        padding: 0;
        --mdc-icon-size: 20px;
      }
      .box {
        position: relative;
        flex: 1;
        min-height: 0;
        border-radius: var(--ch-radius-tile);
        background: var(--ch-surface);
        overflow: hidden;
      }
      .viewport {
        position: absolute;
        inset: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: none;
      }
      .content {
        position: relative;
      }
      .recorded {
        position: absolute;
        left: 72px;
        right: 12px;
        background: rgba(76, 141, 255, 0.12);
        border-radius: 4px;
      }
      .hour {
        position: absolute;
        left: 0;
        right: 0;
        height: 0;
        border-top: 1px solid var(--ch-hairline);
      }
      .hour span {
        position: absolute;
        top: -9px;
        left: 10px;
        font-size: 12px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
        background: var(--ch-surface);
        padding-right: 6px;
      }
      .hour.midnight {
        border-top-color: rgba(255, 255, 255, 0.3);
      }
      .hour.midnight span {
        font-weight: 700;
        color: var(--ch-text);
      }
      .mark {
        position: absolute;
        right: 20px;
        width: 26px;
        padding: 0;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      .mark.alert {
        background: var(--ch-amber);
      }
      .mark.detection {
        right: 50px;
        width: 14px;
        background: rgba(255, 176, 32, 0.45);
      }
      .playhead {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--ch-red);
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .pill {
        position: absolute;
        right: 10px;
        top: -14px;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--ch-red);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .empty {
        position: absolute;
        inset: auto 0 16px 0;
        text-align: center;
        font-size: 13px;
        color: var(--ch-text-secondary);
      }
    `,
  ];
}

customElements.define("camera-hub-vertical-timeline", VerticalTimeline);
