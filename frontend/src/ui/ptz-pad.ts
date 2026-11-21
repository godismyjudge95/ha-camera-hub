import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { type PtzInfo, type PtzMove, getPtzInfo, ptzCommand } from "../api/ptz";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { tokens } from "../styles";

const ARROWS: Array<{ move: PtzMove; icon: string; label: string }> = [
  { move: "up", icon: "mdi:chevron-up", label: "Tilt up" },
  { move: "left", icon: "mdi:chevron-left", label: "Pan left" },
  { move: "right", icon: "mdi:chevron-right", label: "Pan right" },
  { move: "down", icon: "mdi:chevron-down", label: "Tilt down" },
];

// Pan, tilt, zoom and presets for a camera that Frigate controls over ONVIF.
// The camera moves while an arrow is held and stops on release.
export class PtzPad extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    info: { state: true },
    moving: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera;
  declare info: PtzInfo | undefined;
  declare moving: string | undefined;

  override willUpdate(changed: PropertyValues<this>): void {
    const previous = changed.get("camera") as HubCamera | undefined;
    if (changed.has("camera") && previous?.entity_id !== this.camera.entity_id) {
      this.info = undefined;
      getPtzInfo(this.hass, this.camera.instance_id, this.camera.frigate_name).then(
        (info) => (this.info = info),
        () => (this.info = { features: ["pt"], presets: [] }),
      );
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.moving) this.stop();
  }

  private start(event: PointerEvent, action: "move" | "zoom", argument: string): void {
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.moving = `${action}-${argument}`;
    void ptzCommand(this.hass, this.camera.entity_id, action, argument);
  }

  private stop(event?: Event): void {
    event?.stopPropagation();
    if (!this.moving) return;
    this.moving = undefined;
    void ptzCommand(this.hass, this.camera.entity_id, "stop");
  }

  private holdButton(action: "move" | "zoom", argument: string, icon: string, label: string, extra = "") {
    return html`<button
      class="hold ${extra} ${this.moving === `${action}-${argument}` ? "pressed" : ""}"
      aria-label=${label}
      @pointerdown=${(event: PointerEvent) => this.start(event, action, argument)}
      @pointerup=${(event: Event) => this.stop(event)}
      @pointercancel=${(event: Event) => this.stop(event)}
      @contextmenu=${(event: Event) => event.preventDefault()}
      @click=${(event: Event) => event.stopPropagation()}
    >
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  override render() {
    const zoom = this.info?.features.includes("zoom") ?? false;
    return html`
      <div class="pad" @pointerdown=${(event: Event) => event.stopPropagation()}>
        <div class="dpad">
          ${ARROWS.map((arrow) => this.holdButton("move", arrow.move, arrow.icon, arrow.label, arrow.move))}
        </div>
        ${zoom
          ? html`<div class="zoom">
              ${this.holdButton("zoom", "in", "mdi:plus", "Zoom in")}
              ${this.holdButton("zoom", "out", "mdi:minus", "Zoom out")}
            </div>`
          : nothing}
        ${this.info?.presets.length
          ? html`<div class="presets">
              ${this.info.presets.map(
                (preset) => html`<button
                  class="preset"
                  @click=${(event: Event) => {
                    event.stopPropagation();
                    void ptzCommand(this.hass, this.camera.entity_id, "preset", preset);
                  }}
                >
                  <ha-icon icon=${preset === "home" ? "mdi:home" : "mdi:crosshairs-gps"}></ha-icon>
                  ${preset}
                </button>`,
              )}
            </div>`
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
      .pad {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .dpad {
        position: relative;
        width: 168px;
        height: 168px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.45);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .hold {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--ch-text);
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        --mdc-icon-size: 32px;
      }
      .dpad .hold {
        position: absolute;
      }
      .hold.pressed {
        background: var(--ch-accent);
      }
      .up {
        top: 4px;
        left: 56px;
      }
      .down {
        bottom: 4px;
        left: 56px;
      }
      .left {
        left: 4px;
        top: 56px;
      }
      .right {
        right: 4px;
        top: 56px;
      }
      .zoom,
      .presets {
        display: flex;
        gap: 8px;
      }
      .zoom .hold {
        background: rgba(0, 0, 0, 0.45);
      }
      .preset {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.45);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        text-transform: capitalize;
        cursor: pointer;
        --mdc-icon-size: 18px;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
    `,
  ];
}

customElements.define("camera-hub-ptz-pad", PtzPad);
