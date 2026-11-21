import { LitElement, css, html, nothing } from "lit";

import type { HomeAssistant, HubZone } from "../ha-types";
import { tokens } from "../styles";

const DURATIONS = [
  { minutes: 15, label: "15m" },
  { minutes: 30, label: "30m" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
];

const ALL = "all";

// Phone notifications per zone: their state, and buttons to pause and
// resume them, one row per zone. The state comes from the integration's zone
// entities, so every screen shows the same pauses.
export class PauseBar extends LitElement {
  static override properties = {
    hass: { attribute: false },
    zones: { attribute: false },
    now: { state: true },
  };

  declare hass: HomeAssistant;
  declare zones: HubZone[];
  declare now: number;

  private clock?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.zones = [];
    this.now = Date.now();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clock = setInterval(() => (this.now = Date.now()), 15_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clock);
  }

  private pausedUntil(zone: HubZone): number | undefined {
    const on = zone.switch_entity ? this.hass.states[zone.switch_entity]?.state : undefined;
    if (on !== "off") return undefined;
    const until = zone.paused_until_entity
      ? Date.parse(this.hass.states[zone.paused_until_entity]?.state ?? "")
      : Number.NaN;
    return Number.isNaN(until) ? undefined : until;
  }

  private remaining(until: number): string {
    const minutes = Math.max(1, Math.ceil((until - this.now) / 60_000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  private call(service: "pause_zone" | "resume_zone", zone: string, minutes?: number): void {
    void this.hass.callService("camera_hub", service, minutes ? { zone, minutes } : { zone });
  }

  override render() {
    const zones = this.zones.filter((zone) => zone.notify);
    if (zones.length === 0) return nothing;
    const anyPaused = zones.some((zone) => this.pausedUntil(zone) !== undefined);
    return html`
      <p class="intro">Pause the phone notifications of a zone. The cameras keep recording.</p>
      ${zones.map((zone) => {
        const until = this.pausedUntil(zone);
        return html`
          <div class="zone ${until ? "paused" : ""}">
            <div class="zone-head">
              <ha-icon icon=${until ? "mdi:bell-sleep" : "mdi:bell-ring-outline"}></ha-icon>
              <span class="zone-name">${zone.name}</span>
              <span class="zone-state">${until ? `Paused · ${this.remaining(until)} left` : "Alerts on"}</span>
            </div>
            ${this.durationButtons(zone.id, until !== undefined)}
          </div>
        `;
      })}
      ${zones.length > 1
        ? html`
            <div class="zone">
              <div class="zone-head">
                <ha-icon icon="mdi:bell-off-outline"></ha-icon>
                <span class="zone-name">All zones</span>
              </div>
              ${this.durationButtons(ALL, anyPaused)}
            </div>
          `
        : nothing}
    `;
  }

  private durationButtons(zone: string, paused: boolean) {
    return html`
      <div class="chips wrap">
        ${DURATIONS.map(
          (duration) =>
            html`<button class="chip" @click=${() => this.call("pause_zone", zone, duration.minutes)}>
              ${duration.label}
            </button>`,
        )}
        ${paused
          ? html`<button class="chip resume" @click=${() => this.call("resume_zone", zone)}>
              <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Resume
            </button>`
          : nothing}
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        padding: 0 14px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        touch-action: manipulation;
        --mdc-icon-size: 18px;
      }
      .chip:active {
        transform: scale(0.96);
      }
      .chip.resume {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      .intro {
        margin: 6px 4px 12px;
        font-size: 14px;
        color: var(--ch-text-secondary);
      }
      .zone {
        padding: 14px;
        margin-bottom: 10px;
        border-radius: var(--ch-radius-tile);
        background: var(--ch-surface);
      }
      .zone-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        --mdc-icon-size: 22px;
      }
      .zone-name {
        font-size: 16px;
        font-weight: 600;
      }
      .zone-state {
        margin-left: auto;
        font-size: 14px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .zone.paused .zone-head,
      .zone.paused .zone-state {
        color: var(--ch-amber);
      }
      .chips.wrap {
        flex-wrap: wrap;
        overflow: visible;
      }
      .chips.wrap .chip {
        min-height: 44px;
        min-width: 64px;
        justify-content: center;
      }
    `,
  ];
}

customElements.define("camera-hub-pause-bar", PauseBar);
