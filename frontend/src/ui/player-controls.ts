import { LitElement, css, html, nothing } from "lit";

import { tokens } from "../styles";

// "live": a live camera. "playback": a camera's recording, rewound from live.
// "clip": the recording of one alert.
export type ControlsMode = "live" | "playback" | "clip";

export interface TalkState {
  available: boolean;
  active: boolean;
  // Why talk is not possible, when it is not.
  reason?: string;
}

export type ControlAction =
  | {
      action:
        | "play"
        | "pause"
        | "mute"
        | "unmute"
        | "talk-start"
        | "talk-stop"
        | "ptz"
        | "fullscreen"
        | "rewind"
        | "live";
    }
  | { action: "seek"; seconds: number }
  | { action: "skip"; seconds: number }
  | { action: "rate"; rate: number };

const RATES = [1, 2, 4];

// The control bar of a video. It only shows state and reports each tap as a
// `control` event; the view that owns the video acts on it.
export class PlayerControls extends LitElement {
  static override properties = {
    mode: { attribute: false },
    paused: { attribute: false },
    muted: { attribute: false },
    position: { attribute: false },
    duration: { attribute: false },
    clockStart: { attribute: false },
    rate: { attribute: false },
    talk: { attribute: false },
    fullscreen: { attribute: false },
    rewinding: { attribute: false },
    ptz: { attribute: false },
    ptzOpen: { attribute: false },
    dragging: { state: true },
  };

  declare mode: ControlsMode;
  declare paused: boolean;
  declare muted: boolean;
  // Seconds into the recording, and its length.
  declare position: number;
  declare duration: number;
  // For "playback": the wall-clock time (epoch seconds) of position 0, so the
  // bar can show the time of day.
  declare clockStart: number | undefined;
  declare rate: number;
  declare talk: TalkState | undefined;
  declare fullscreen: boolean;
  // The rewind timeline is open.
  declare rewinding: boolean;
  // The camera has pan and tilt, and whether its pad is open.
  declare ptz: boolean;
  declare ptzOpen: boolean;
  declare dragging: number | undefined;

  constructor() {
    super();
    this.mode = "live";
    this.paused = false;
    this.muted = true;
    this.position = 0;
    this.duration = 0;
    this.rate = 1;
    this.fullscreen = false;
    this.rewinding = false;
    this.ptz = false;
    this.ptzOpen = false;
  }

  private send(detail: ControlAction): void {
    this.dispatchEvent(new CustomEvent("control", { detail, bubbles: true, composed: true }));
  }

  private button(icon: string, label: string, detail: ControlAction, extra = "") {
    return html`<button
      class="control ${extra}"
      aria-label=${label}
      title=${label}
      @click=${(event: Event) => {
        event.stopPropagation();
        this.send(detail);
      }}
    >
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  private timeLabel(seconds: number): string {
    if (this.mode === "playback" && this.clockStart !== undefined) {
      return new Date((this.clockStart + seconds) * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  }

  override render() {
    return this.mode === "live" ? this.renderLive() : this.renderPlayback();
  }

  private renderLive() {
    const talk = this.talk;
    return html`
      <div class="bar">
        ${this.muted
          ? this.button("mdi:volume-off", "Sound on", { action: "unmute" })
          : this.button("mdi:volume-high", "Sound off", { action: "mute" })}
        ${talk
          ? html`<button
              class="control talk ${talk.active ? "active" : ""} ${talk.available ? "" : "unavailable"}"
              aria-label="Hold to talk"
              title=${talk.reason ?? "Hold to talk"}
              @pointerdown=${(event: PointerEvent) => {
                event.stopPropagation();
                event.preventDefault();
                (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                this.send({ action: "talk-start" });
              }}
              @pointerup=${() => this.send({ action: "talk-stop" })}
              @pointercancel=${() => this.send({ action: "talk-stop" })}
              @contextmenu=${(event: Event) => event.preventDefault()}
              @click=${(event: Event) => event.stopPropagation()}
            >
              <ha-icon icon=${talk.active ? "mdi:microphone" : "mdi:microphone-outline"}></ha-icon>
              <span>Hold to talk</span>
            </button>`
          : nothing}
        ${this.ptz
          ? this.button("mdi:arrow-all", this.ptzOpen ? "Close pan and tilt" : "Pan and tilt", { action: "ptz" }, this.ptzOpen ? "on" : "")
          : nothing}
        <span class="spacer"></span>
        ${this.button("mdi:history", this.rewinding ? "Close timeline" : "Rewind", { action: "rewind" }, this.rewinding ? "on" : "")}
        ${this.button(this.fullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen", "Full screen", { action: "fullscreen" })}
      </div>
    `;
  }

  private renderPlayback() {
    const shown = this.dragging ?? this.position;
    return html`
      <div class="bar">
        ${this.paused
          ? this.button("mdi:play", "Play", { action: "play" })
          : this.button("mdi:pause", "Pause", { action: "pause" })}
        ${this.button("mdi:rewind-10", "Back 10 seconds", { action: "skip", seconds: -10 }, "skip")}
        ${this.button("mdi:fast-forward-10", "Forward 10 seconds", { action: "skip", seconds: 10 }, "skip")}
        <span class="time">${this.timeLabel(shown)}</span>
        <input
          class="seek"
          type="range"
          min="0"
          max=${Math.max(this.duration, 0.1)}
          step="0.1"
          .value=${String(shown)}
          aria-label="Position"
          @click=${(event: Event) => event.stopPropagation()}
          @input=${(event: Event) => (this.dragging = Number((event.target as HTMLInputElement).value))}
          @change=${(event: Event) => {
            const seconds = Number((event.target as HTMLInputElement).value);
            this.dragging = undefined;
            this.send({ action: "seek", seconds });
          }}
        />
        ${this.mode === "clip" ? html`<span class="time">${this.timeLabel(this.duration)}</span>` : nothing}
        <button
          class="control rate"
          aria-label="Playback speed"
          @click=${(event: Event) => {
            event.stopPropagation();
            const next = RATES[(RATES.indexOf(this.rate) + 1) % RATES.length];
            this.send({ action: "rate", rate: next });
          }}
        >
          ${this.rate}×
        </button>
        ${this.muted
          ? this.button("mdi:volume-off", "Sound on", { action: "unmute" })
          : this.button("mdi:volume-high", "Sound off", { action: "mute" })}
        ${this.mode === "playback"
          ? this.button(
              "mdi:history",
              this.rewinding ? "Close timeline" : "Timeline",
              { action: "rewind" },
              `timeline-toggle ${this.rewinding ? "on" : ""}`,
            )
          : nothing}
        ${this.button(this.fullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen", "Full screen", { action: "fullscreen" })}
        ${this.mode === "playback"
          ? html`<button
              class="control live"
              aria-label="Back to live"
              @click=${(event: Event) => {
                event.stopPropagation();
                this.send({ action: "live" });
              }}
            >
              <span class="dot"></span>Live
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
        container-type: inline-size;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
      }
      .spacer {
        flex: 1;
      }
      .control {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 48px;
        height: 48px;
        padding: 0 10px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.45);
        color: var(--ch-text);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .control:active {
        transform: scale(0.94);
      }
      .control.on {
        background: var(--ch-accent);
      }
      .control.unavailable {
        opacity: 0.45;
      }
      .talk {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .talk.active {
        background: var(--ch-red);
      }
      .rate {
        min-width: 56px;
        font-variant-numeric: tabular-nums;
      }
      .live .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-red);
      }
      ha-icon {
        --mdc-icon-size: 24px;
      }
      .time {
        min-width: 64px;
        padding: 0 4px;
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
        white-space: nowrap;
      }
      .seek {
        flex: 1;
        min-width: 80px;
        height: 48px;
        margin: 0 4px;
        accent-color: var(--ch-accent);
        cursor: pointer;
      }
      /* A phone: the seek bar gets its own row, and the buttons that the seek
         bar and the open timeline make unneeded are left out. */
      @container (max-width: 560px) {
        .bar {
          flex-wrap: wrap;
          row-gap: 0;
          padding: 6px 8px;
        }
        .seek {
          order: -1;
          flex: 1 0 100%;
          height: 32px;
          margin: 0;
        }
        .skip,
        .timeline-toggle {
          display: none;
        }
        .control {
          min-width: 44px;
          height: 44px;
        }
      }
    `,
  ];
}

customElements.define("camera-hub-player-controls", PlayerControls);
