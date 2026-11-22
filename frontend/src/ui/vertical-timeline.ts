import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { getCameraReviews, getRecordingsSummary } from "../api/frigate";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { type Review, reviewLabel } from "../reviews";
import { tokens } from "../styles";
import { errorMessage } from "../errors";
import { logger } from "../log";
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

const log = logger("timeline");

// Space above "now" at the top of the timeline.
const TOP = 28;
const ZOOMS = [30, 60, 120, 240, 480];
const DEFAULT_ZOOM = 120;
// While the user drags the play line, the video follows at most this often.
const SCRUB_INTERVAL_MS = 250;
// Times this close to now count as live.
const LIVE_SECONDS = 20;
// Extra pixels drawn above and below the visible part.
const OVERSCAN = 800;
// A drag near the top or bottom edge scrolls the timeline by this much.
const EDGE = 48;
const EDGE_STEP = 14;

// A vertical timeline of one camera's recordings, newest at the top, as far
// back as Frigate has recordings.
// - Scrolling only browses; it never changes what plays.
// - A tap plays from the tapped time (`timeline-seek`, epoch seconds or null
//   for live). A tap on an alert or detection plays that event.
// - Dragging the red play line scrubs: `timeline-scrub` while it moves and
//   `timeline-seek` when it is let go.
// The play line sits at the playing time and moves with it. The timeline
// scrolls to keep it in view, until the user scrolls away to browse.
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
    dragTime: { state: true },
    visibleDay: { state: true },
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
  // The time under the play line while the user drags it.
  declare dragTime: number | null;
  // The local day at the top of the visible part.
  declare visibleDay: string;

  private readonly loadingDays = new Set<string>();
  // True after the user scrolls away; the timeline then stops following
  // playback until the next tap or drag.
  private browsing = false;
  private ignoreScroll = false;
  private lastScrub = 0;
  private clockTimer?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.position = null;
    this.days = [];
    this.reviews = new Map();
    this.pixelsPerHour = DEFAULT_ZOOM;
    this.now = Date.now() / 1000;
    this.view = [0, 2000];
    this.dragTime = null;
    this.visibleDay = localDay(this.now);
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

  // The position of a time inside the scrolled content.
  private y(time: number): number {
    return TOP + offsetOf(this.scale, time);
  }

  // The time at a position inside the scrolled content, kept between the
  // oldest recording and now.
  private timeAtY(y: number): number {
    return Math.min(this.now, Math.max(this.oldest, timeAt(this.scale, y - TOP)));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clockTimer = setInterval(() => (this.now = Date.now() / 1000), 30_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clockTimer);
  }

  override willUpdate(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous?.entity_id !== this.camera?.entity_id) {
      this.days = [];
      this.reviews = new Map();
      this.loadingDays.clear();
      this.browsing = false;
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
    } catch (error) {
      log.warn(`The recordings of ${camera.frigate_name} did not load: ${errorMessage(error)}`);
      this.days = [];
    }
  }

  private loadVisibleReviews(): void {
    const camera = this.camera;
    if (!camera) return;
    const newest = timeAt(this.scale, Math.max(0, this.view[0] - TOP));
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
        (error) => {
          log.warn(`The events of ${camera.frigate_name} on ${day} did not load: ${errorMessage(error)}`);
          this.loadingDays.delete(day);
        },
      );
    }
  }

  private scrollToY(top: number): void {
    const viewport = this.viewport;
    if (!viewport) return;
    this.ignoreScroll = true;
    viewport.scrollTop = Math.max(0, top);
    requestAnimationFrame(() => (this.ignoreScroll = false));
    this.updateView();
  }

  // Keeps the play line in view while the user is not browsing.
  private follow(): void {
    const viewport = this.viewport;
    if (!viewport || this.browsing || this.dragTime !== null) return;
    const line = this.y(this.position ?? this.now);
    const top = viewport.scrollTop;
    const bottom = top + viewport.clientHeight;
    if (line >= top + EDGE && line <= bottom - EDGE) return;
    this.scrollToY(line - viewport.clientHeight / 3);
  }

  private updateView(): void {
    const viewport = this.viewport;
    if (!viewport) return;
    const from = viewport.scrollTop - OVERSCAN;
    const to = viewport.scrollTop + viewport.clientHeight + OVERSCAN;
    if (Math.abs(from - this.view[0]) > OVERSCAN / 2 || Math.abs(to - this.view[1]) > OVERSCAN / 2) {
      this.view = [from, to];
    }
    const day = localDay(this.timeAtY(viewport.scrollTop + TOP));
    if (day !== this.visibleDay) this.visibleDay = day;
  }

  private onScroll(): void {
    this.updateView();
    if (!this.ignoreScroll && this.dragTime === null) this.browsing = true;
  }

  // Plays from `time`; times close to now play live.
  private seek(time: number): void {
    this.browsing = false;
    const live = time >= Date.now() / 1000 - LIVE_SECONDS;
    this.dispatchEvent(
      new CustomEvent("timeline-seek", { detail: live ? null : time, bubbles: true, composed: true }),
    );
  }

  private contentY(event: PointerEvent | MouseEvent): number {
    const content = this.renderRoot.querySelector<HTMLElement>(".content")!;
    return event.clientY - content.getBoundingClientRect().top;
  }

  // A tap (not a scroll) on the timeline plays from the tapped time.
  private onTap(event: MouseEvent): void {
    this.seek(this.timeAtY(this.contentY(event)));
  }

  private onMarkTap(event: Event, review: Review): void {
    event.stopPropagation();
    this.seek(Math.max(this.oldest, review.start_time - 2));
  }

  private onDragStart(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.browsing = false;
    this.dragTime = this.timeAtY(this.contentY(event));
  }

  private onDragMove(event: PointerEvent): void {
    if (this.dragTime === null) return;
    const viewport = this.viewport!;
    const box = viewport.getBoundingClientRect();
    if (event.clientY < box.top + EDGE) viewport.scrollTop -= EDGE_STEP;
    else if (event.clientY > box.bottom - EDGE) viewport.scrollTop += EDGE_STEP;
    const time = this.timeAtY(this.contentY(event));
    this.dragTime = time;
    if (Date.now() - this.lastScrub < SCRUB_INTERVAL_MS) return;
    this.lastScrub = Date.now();
    this.dispatchEvent(new CustomEvent("timeline-scrub", { detail: time, bubbles: true, composed: true }));
  }

  private onDragEnd(): void {
    const time = this.dragTime;
    if (time === null) return;
    this.dragTime = null;
    this.seek(time);
  }

  // Scrolls to the newest recording of a day. It does not change what plays.
  private showDay(day: RecordingDay): void {
    const latest = day.hours.length ? localTime(day.day, day.hours.at(-1)! + 1) : localTime(day.day) + 86_399;
    this.browsing = true;
    this.scrollToY(this.y(Math.min(latest, this.now)) - TOP);
  }

  private zoom(step: number): void {
    const index = ZOOMS.indexOf(this.pixelsPerHour);
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, index + step))];
    if (next === this.pixelsPerHour) return;
    const viewport = this.viewport;
    if (!viewport) return;
    // Keep the time in the middle of the view in place.
    const middle = viewport.clientHeight / 2;
    const time = this.timeAtY(viewport.scrollTop + middle);
    this.pixelsPerHour = next;
    void this.updateComplete.then(() => this.scrollToY(this.y(time) - middle));
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
    const visibleNewest = timeAt(scale, Math.max(0, from - TOP));
    const visibleOldest = timeAt(scale, to);
    const y = (time: number) => this.y(time);
    const height = y(this.oldest) + 600;
    const shown = this.dragTime ?? this.position;
    const live = shown === null;
    const line = y(shown ?? this.now);

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
              class="day ${day.day === this.visibleDay ? "on" : ""}"
              @click=${() => this.showDay(day)}
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
        <div class="viewport" @scroll=${this.onScroll}>
          <div class="content" style="height: ${height}px" @click=${this.onTap}>
            <div class="now" style="top: ${y(this.now)}px"><span>Now</span></div>
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
                @click=${(event: Event) => this.onMarkTap(event, review)}
              ></button>`;
            })}
            <div
              class="playhead ${this.dragTime !== null ? "dragging" : ""}"
              style="top: ${line}px"
              @pointerdown=${this.onDragStart}
              @pointermove=${this.onDragMove}
              @pointerup=${this.onDragEnd}
              @pointercancel=${this.onDragEnd}
              @click=${(event: Event) => event.stopPropagation()}
            >
              <div class="line"></div>
              <span class="pill ${live ? "live" : ""}">
                <ha-icon icon="mdi:drag-vertical"></ha-icon>
                ${live ? "Live" : `${this.dayLabel(localDay(shown))} · ${this.clock(shown, true)}`}
              </span>
            </div>
          </div>
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
      .now {
        position: absolute;
        left: 0;
        right: 0;
        height: 0;
        border-top: 1px dashed rgba(255, 255, 255, 0.35);
      }
      .now span {
        position: absolute;
        top: -9px;
        left: 10px;
        font-size: 12px;
        font-weight: 700;
        color: var(--ch-text);
        background: var(--ch-surface);
        padding-right: 6px;
      }
      /* The play line. Its grab area is taller than the line and stops the
         drag from scrolling the timeline. */
      .playhead {
        position: absolute;
        left: 0;
        right: 0;
        height: 40px;
        margin-top: -20px;
        z-index: 2;
        cursor: grab;
        touch-action: none;
      }
      .playhead.dragging {
        cursor: grabbing;
      }
      .line {
        position: absolute;
        left: 0;
        right: 0;
        top: 19px;
        height: 2px;
        background: var(--ch-red);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .pill {
        position: absolute;
        right: 8px;
        top: 6px;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 10px 4px 4px;
        border-radius: 999px;
        background: var(--ch-red);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        --mdc-icon-size: 18px;
      }
      .playhead.dragging .pill {
        transform: scale(1.08);
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
