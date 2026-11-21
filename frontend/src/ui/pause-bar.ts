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
// resume them. The state comes from the integration's zone entities, so every
// screen shows the same pauses.
export class PauseBar extends LitElement {
  static override properties = {
    hass: { attribute: false },
    zones: { attribute: false },
    open: { state: true },
    now: { state: true },
  };

  declare hass: HomeAssistant;
  declare zones: HubZone[];
  // The zone whose duration buttons are open, or "all".
  declare open: string | undefined;
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
    this.open = undefined;
  }

  override render() {
    const zones = this.zones.filter((zone) => zone.notify);
    if (zones.length === 0) return nothing;
    const openZone = zones.find((zone) => zone.id === this.open);
    const anyPaused = zones.some((zone) => this.pausedUntil(zone) !== undefined);
    return html`
      <div class="row">
        <span class="title">Phone alerts</span>
        <div class="chips">
          ${zones.map((zone) => {
            const until = this.pausedUntil(zone);
            return html`
              <button
                class="chip ${until ? "paused" : ""} ${this.open === zone.id ? "open" : ""}"
                @click=${() => (this.open = this.open === zone.id ? undefined : zone.id)}
              >
                <ha-icon icon=${until ? "mdi:bell-sleep" : "mdi:bell-ring-outline"}></ha-icon>
                ${zone.name}
                <span class="state">${until ? `Paused · ${this.remaining(until)}` : "On"}</span>
              </button>
            `;
          })}
          ${zones.length > 1
            ? html`<button
                class="chip ${this.open === ALL ? "open" : ""}"
                @click=${() => (this.open = this.open === ALL ? undefined : ALL)}
              >
                All
              </button>`
            : nothing}
        </div>
      </div>
      ${this.open
        ? html`
            <div class="row options">
              <span class="title">
                ${openZone ? `Pause ${openZone.name}` : "Pause all zones"}
              </span>
              <div class="chips">
                ${DURATIONS.map(
                  (duration) => html`<button
                    class="chip"
                    @click=${() => this.call("pause_zone", this.open!, duration.minutes)}
                  >
                    ${duration.label}
                  </button>`,
                )}
                ${(openZone ? this.pausedUntil(openZone) : anyPaused)
                  ? html`<button class="chip resume" @click=${() => this.call("resume_zone", this.open!)}>
                      <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Resume
                    </button>`
                  : nothing}
              </div>
            </div>
          `
        : nothing}
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .options {
        margin-top: 8px;
        animation: open 150ms ease;
      }
      .title {
        flex: none;
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
      .chip .state {
        font-weight: 500;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .chip.paused {
        border-color: rgba(255, 176, 32, 0.5);
        color: var(--ch-amber);
      }
      .chip.paused .state {
        color: var(--ch-amber);
      }
      .chip.open {
        border-color: var(--ch-accent);
      }
      .chip.resume {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      @keyframes open {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
      }
    `,
  ];
}

customElements.define("camera-hub-pause-bar", PauseBar);
