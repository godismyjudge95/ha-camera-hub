import { LitElement, css, html, nothing, type PropertyValues } from "lit";

import { snapshotUrl } from "../api/snapshot";
import type { HomeAssistant, HubCamera } from "../ha-types";
import { LivePlayer, type PlayerStatus } from "../player/live-player";
import { Talk, type TalkUpdate, talkUnavailableReason } from "../player/talk";
import { spinnerStyles, tokens } from "../styles";
import "./talk-banner";

// Without a touch, the doorbell closes after this long. Each touch and each
// new ring starts it again; it never closes while someone talks.
const IDLE_CLOSE_MS = 60_000;

// The doorbell takeover: the doorbell camera over the whole screen, with
// push to talk and a dismiss button.
export class DoorbellOverlay extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    activeEntity: { attribute: false },
    status: { state: true },
    talkUpdate: { state: true },
    muted: { state: true },
    now: { state: true },
  };

  declare hass: HomeAssistant;
  declare camera: HubCamera;
  // The integration's doorbell sensor: on while the takeover shows.
  declare activeEntity: string;
  declare status: PlayerStatus;
  declare talkUpdate: TalkUpdate;
  declare muted: boolean;
  declare now: number;

  private player?: LivePlayer;
  private readonly talk = new Talk(
    () => this.hass,
    (update) => (this.talkUpdate = update),
  );
  private closeAt = Date.now() + IDLE_CLOSE_MS;
  private clock?: ReturnType<typeof setInterval>;
  private startedAt?: string;

  constructor() {
    super();
    this.status = { state: "connecting" };
    this.talkUpdate = { phase: "idle", level: 0 };
    this.muted = true;
    this.now = Date.now();
    this.addEventListener("pointerdown", () => this.keepOpen());
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.keepOpen();
    this.clock = setInterval(() => this.tick(), 250);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.clock);
    this.player?.stop();
    this.talk.close();
  }

  override firstUpdated(): void {
    const video = this.renderRoot.querySelector("video")!;
    this.player = new LivePlayer(() => this.hass, video, (status) => (this.status = status));
    this.player.play({
      instanceId: this.camera.instance_id,
      stream: this.camera.stream,
      iceEntityId: this.camera.entity_id,
    });
  }

  override willUpdate(changed: PropertyValues<this>): void {
    // A new ring while the doorbell shows starts the time again.
    const startedAt = this.attribute("started_at");
    if (changed.has("hass") && startedAt !== this.startedAt) {
      this.startedAt = startedAt;
      this.keepOpen();
    }
  }

  override updated(): void {
    const video = this.renderRoot.querySelector("video");
    if (video) video.muted = this.muted;
  }

  private attribute(name: string): string | undefined {
    const value = this.hass.states[this.activeEntity]?.attributes[name];
    return typeof value === "string" ? value : undefined;
  }

  private keepOpen(): void {
    this.closeAt = Date.now() + IDLE_CLOSE_MS;
  }

  private tick(): void {
    this.now = Date.now();
    if (this.talkUpdate.phase === "talking" || this.talkUpdate.phase === "connecting") {
      this.keepOpen();
    } else if (this.now >= this.closeAt) {
      this.dismiss();
    }
  }

  private dismiss(): void {
    clearInterval(this.clock);
    void this.hass.callService("camera_hub", "dismiss_doorbell");
  }

  private startTalking(event: PointerEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const reason = talkUnavailableReason();
    if (reason) {
      this.talkUpdate = { phase: "error", level: 0, message: reason };
      return;
    }
    void this.talk.press({
      instanceId: this.camera.instance_id,
      stream: this.camera.stream,
      iceEntityId: this.camera.entity_id,
    });
  }

  private stopTalking(): void {
    this.talk.release();
    if (this.talkUpdate.phase === "error") {
      setTimeout(() => (this.talkUpdate = { phase: "idle", level: 0 }), 4000);
    }
  }

  private headline(): string {
    const trigger = this.attribute("trigger");
    const started = Date.parse(this.attribute("started_at") ?? "");
    const seconds = Number.isNaN(started) ? 0 : Math.max(0, Math.floor((this.now - started) / 1000));
    const ago = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} ago`;
    return trigger === "ring" ? `The doorbell rang · ${ago}` : `Someone is at the door · ${ago}`;
  }

  override render() {
    const playing = this.status.state === "playing";
    const snapshot = playing ? undefined : snapshotUrl(this.hass, this.camera.entity_id, 0);
    const left = Math.max(0, Math.min(1, (this.closeAt - this.now) / IDLE_CLOSE_MS));
    const talking = this.talkUpdate.phase === "talking" || this.talkUpdate.phase === "connecting";
    return html`
      <div class="panel" role="dialog" aria-label="Doorbell">
        <div class="header">
          <div>
            <div class="name">${this.camera.name}</div>
            <div class="when">${this.headline()}</div>
          </div>
        </div>
        <div class="frame">
          <video muted playsinline autoplay></video>
          ${snapshot ? html`<img class="snapshot" src=${snapshot} alt="" />` : nothing}
          ${!playing ? html`<div class="spinner"></div>` : nothing}
          <camera-hub-talk-banner .talk=${this.talkUpdate}></camera-hub-talk-banner>
        </div>
        <div class="actions">
          ${this.camera.talk
            ? html`<button
                class="action talk ${talking ? "active" : ""} ${talkUnavailableReason() ? "unavailable" : ""}"
                @pointerdown=${this.startTalking}
                @pointerup=${this.stopTalking}
                @pointercancel=${this.stopTalking}
                @contextmenu=${(event: Event) => event.preventDefault()}
              >
                <ha-icon icon=${talking ? "mdi:microphone" : "mdi:microphone-outline"}></ha-icon>
                Hold to talk
              </button>`
            : nothing}
          <button class="action" @click=${() => (this.muted = !this.muted)}>
            <ha-icon icon=${this.muted ? "mdi:volume-off" : "mdi:volume-high"}></ha-icon>
            ${this.muted ? "Sound on" : "Sound off"}
          </button>
          <button class="action dismiss" @click=${this.dismiss}>
            <ha-icon icon="mdi:close"></ha-icon>
            Dismiss
          </button>
        </div>
        <div class="countdown" style="transform: scaleX(${left})"></div>
      </div>
    `;
  }

  static override styles = [
    tokens,
    spinnerStyles,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: grid;
        place-items: center;
        padding: 16px;
        background: rgba(0, 0, 0, 0.88);
        animation: fade 180ms ease;
      }
      .panel {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: min(1200px, 100%, calc((100vh - 200px) * 16 / 9));
      }
      .name {
        font-size: 30px;
        font-weight: 700;
      }
      .when {
        font-size: 16px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      video,
      .snapshot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      video {
        object-fit: contain;
      }
      .snapshot {
        object-fit: fill;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      .action {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        height: 72px;
        border: 0;
        border-radius: 999px;
        background: var(--ch-surface-raised);
        color: var(--ch-text);
        font: inherit;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        --mdc-icon-size: 28px;
      }
      .action:active {
        transform: scale(0.97);
      }
      .talk {
        flex: 2;
        background: var(--ch-accent);
      }
      .talk.active {
        background: var(--ch-red);
      }
      .talk.unavailable {
        opacity: 0.45;
      }
      .dismiss {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.25);
      }
      .countdown {
        height: 3px;
        border-radius: 2px;
        background: var(--ch-text-secondary);
        transform-origin: left;
        transition: transform 250ms linear;
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
    `,
  ];
}

customElements.define("camera-hub-doorbell-overlay", DoorbellOverlay);
