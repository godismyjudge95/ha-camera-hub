import { LitElement, css, html, nothing } from "lit";

import { tokens } from "../styles";

export interface TimelineMarker {
  time: number;
  label: string;
}

const TICK_SECONDS = 30 * 60;

// The rewind timeline of one camera: the last hours, with the camera's
// alerts marked. A tap or a drag picks a time and reports it as a
// `timeline-seek` event (epoch seconds).
export class Timeline extends LitElement {
  static override properties = {
    start: { attribute: false },
    end: { attribute: false },
    markers: { attribute: false },
    position: { attribute: false },
    hover: { state: true },
  };

  // Epoch seconds.
  declare start: number;
  declare end: number;
  declare markers: TimelineMarker[];
  // The time playing now, or undefined when the camera is live.
  declare position: number | undefined;
  declare hover: number | undefined;

  constructor() {
    super();
    this.markers = [];
  }

  private fraction(time: number): number {
    return Math.min(1, Math.max(0, (time - this.start) / (this.end - this.start)));
  }

  private timeAt(event: PointerEvent): number {
    const track = this.renderRoot.querySelector(".track")!.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - track.left) / track.width));
    return this.start + fraction * (this.end - this.start);
  }

  private onPointerDown(event: PointerEvent): void {
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.hover = this.timeAt(event);
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.hover !== undefined) this.hover = this.timeAt(event);
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.hover === undefined) return;
    const time = this.timeAt(event);
    this.hover = undefined;
    this.dispatchEvent(new CustomEvent("timeline-seek", { detail: time, bubbles: true, composed: true }));
  }

  private clock(time: number, seconds = false): string {
    return new Date(time * 1000).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" } : {}),
    });
  }

  override render() {
    const ticks: number[] = [];
    for (let tick = Math.ceil(this.start / TICK_SECONDS) * TICK_SECONDS; tick < this.end; tick += TICK_SECONDS) {
      ticks.push(tick);
    }
    const needle = this.hover ?? this.position;
    return html`
      <div
        class="track"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${() => (this.hover = undefined)}
        @click=${(event: Event) => event.stopPropagation()}
      >
        ${ticks.map(
          (tick) => html`
            <span class="tick ${tick % 3600 === 0 ? "hour" : "half"}" style="left: ${this.fraction(tick) * 100}%">
              ${this.fraction(tick) < 0.9
                ? html`<span class="tick-label">${this.clock(tick)}</span>`
                : nothing}
            </span>
          `,
        )}
        ${this.markers.map(
          (marker) => html`<span
            class="marker"
            style="left: ${this.fraction(marker.time) * 100}%"
            title=${marker.label}
          ></span>`,
        )}
        <span class="now-label">Now</span>
        ${needle !== undefined
          ? html`
              <span class="needle" style="left: ${this.fraction(needle) * 100}%">
                <span class="needle-label">${this.clock(needle, true)}</span>
              </span>
            `
          : nothing}
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
        padding: 26px 18px 10px;
        container-type: inline-size;
      }
      /* On a phone only the full hours have labels, so they do not overlap. */
      @container (max-width: 560px) {
        .half .tick-label {
          display: none;
        }
      }
      .track {
        position: relative;
        height: 40px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.12);
        cursor: pointer;
        touch-action: none;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.25);
      }
      .tick-label,
      .now-label {
        position: absolute;
        top: -20px;
        transform: translateX(-50%);
        font-size: 11px;
        color: var(--ch-text-secondary);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .now-label {
        right: 0;
        transform: none;
      }
      .marker {
        position: absolute;
        top: 8px;
        bottom: 8px;
        width: 4px;
        margin-left: -2px;
        border-radius: 2px;
        background: var(--ch-amber);
      }
      .needle {
        position: absolute;
        top: -4px;
        bottom: -4px;
        width: 3px;
        margin-left: -1.5px;
        border-radius: 2px;
        background: var(--ch-text);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
      }
      .needle-label {
        position: absolute;
        bottom: calc(100% + 4px);
        left: 50%;
        transform: translateX(-50%);
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--ch-text);
        color: var(--ch-bg);
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
    `,
  ];
}

customElements.define("camera-hub-timeline", Timeline);
