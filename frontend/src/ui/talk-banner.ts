import { LitElement, css, html, nothing } from "lit";

import type { TalkUpdate } from "../player/talk";
import { tokens } from "../styles";

const LEVELS = [0.15, 0.35, 0.55, 0.75, 0.9];

// Shown at the top of the video while the talk button is held, because the
// finger on the button hides the button itself. It shows a level meter, so
// you can see that the microphone hears you.
export class TalkBanner extends LitElement {
  static override properties = {
    talk: { attribute: false },
  };

  declare talk: TalkUpdate | undefined;

  override render() {
    const update = this.talk;
    if (!update || update.phase === "idle") return nothing;
    if (update.phase === "error") {
      return html`<div class="banner error">
        <ha-icon icon="mdi:microphone-off"></ha-icon>${update.message}
      </div>`;
    }
    return html`
      <div class="banner">
        <ha-icon icon="mdi:microphone"></ha-icon>
        <span>${update.phase === "connecting" ? "Connecting microphone…" : "Talking"}</span>
        <span class="meter" aria-hidden="true">
          ${LEVELS.map((level) => html`<span class="bar ${update.level >= level ? "lit" : ""}"></span>`)}
        </span>
        <span class="hint">Release to stop</span>
      </div>
    `;
  }

  static override styles = [
    tokens,
    css`
      :host {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        pointer-events: none;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        border-radius: 999px;
        background: var(--ch-red);
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
        animation: drop 150ms ease;
        --mdc-icon-size: 22px;
      }
      .banner.error {
        background: var(--ch-amber);
        color: #000;
        font-size: 14px;
      }
      .hint {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.8;
      }
      .meter {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        height: 18px;
      }
      .bar {
        width: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.35);
      }
      .bar:nth-child(1) {
        height: 6px;
      }
      .bar:nth-child(2) {
        height: 9px;
      }
      .bar:nth-child(3) {
        height: 12px;
      }
      .bar:nth-child(4) {
        height: 15px;
      }
      .bar:nth-child(5) {
        height: 18px;
      }
      .bar.lit {
        background: #fff;
      }
      @keyframes drop {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
      }
    `,
  ];
}

customElements.define("camera-hub-talk-banner", TalkBanner);
