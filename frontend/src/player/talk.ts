// Push to talk: microphone audio to a camera's speaker over a go2rtc
// backchannel.
//
// Talk uses its own WebRTC connection that only sends audio, so the video
// keeps playing on its own connection. Between presses the connection stays
// open with the microphone muted, so the next press starts at once; it closes
// after IDLE_CLOSE_MS without a press.

import { getIceServers } from "../api/ha";
import type { HomeAssistant } from "../ha-types";
import { type StreamSource, negotiate, openSocket, waitForConnection } from "./go2rtc-socket";
import { errorMessage } from "../errors";

const CONNECT_TIMEOUT_MS = 8000;
const IDLE_CLOSE_MS = 30_000;

export type TalkPhase = "idle" | "connecting" | "talking" | "error";

export interface TalkUpdate {
  phase: TalkPhase;
  // Microphone loudness from 0 to 1, while talking.
  level: number;
  message?: string;
}

// Why talk cannot work on this page, or undefined when it can.
export function talkUnavailableReason(): string | undefined {
  if (!window.isSecureContext) return "Talk needs Home Assistant over HTTPS";
  // The Home Assistant app for macOS, for example, has neither.
  if (typeof RTCPeerConnection === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "Talk does not work in this app. Open Home Assistant in a web browser to talk.";
  }
  return undefined;
}

export class Talk {
  private source?: StreamSource;
  private pc?: RTCPeerConnection;
  private ws?: WebSocket;
  private microphone?: MediaStream;
  private audio?: AudioContext;
  private meterFrame?: number;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private connecting?: Promise<void>;
  private pressed = false;

  constructor(
    private readonly getHass: () => HomeAssistant,
    private readonly onUpdate: (update: TalkUpdate) => void,
  ) {}

  // The button went down.
  async press(source: StreamSource): Promise<void> {
    this.pressed = true;
    clearTimeout(this.closeTimer);
    if (this.source && this.source.stream !== source.stream) this.close();
    this.source = source;
    try {
      if (!this.pc) {
        this.onUpdate({ phase: "connecting", level: 0 });
        this.connecting ??= this.connect(source);
        await this.connecting;
      }
      if (!this.pressed) return;
      this.setMicrophone(true);
      this.onUpdate({ phase: "talking", level: 0 });
      this.startMeter();
    } catch (error) {
      this.close();
      this.onUpdate({ phase: "error", level: 0, message: talkErrorMessage(error) });
    }
  }

  // The button came up: mute, and keep the connection for the next press.
  release(): void {
    this.pressed = false;
    this.setMicrophone(false);
    this.stopMeter();
    if (this.pc) this.onUpdate({ phase: "idle", level: 0 });
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.close(), IDLE_CLOSE_MS);
  }

  close(): void {
    clearTimeout(this.closeTimer);
    this.stopMeter();
    this.pc?.close();
    this.ws?.close();
    for (const track of this.microphone?.getTracks() ?? []) track.stop();
    void this.audio?.close().catch(() => undefined);
    this.pc = undefined;
    this.ws = undefined;
    this.microphone = undefined;
    this.audio = undefined;
    this.connecting = undefined;
  }

  private async connect(source: StreamSource): Promise<void> {
    const reason = talkUnavailableReason();
    if (reason) throw new Error(reason);
    const hass = this.getHass();
    const [microphone, iceServers, ws] = await Promise.all([
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      }),
      getIceServers(hass, source.iceEntityId),
      openSocket(hass, source),
    ]);
    this.microphone = microphone;
    this.ws = ws;
    const pc = new RTCPeerConnection({ iceServers });
    this.pc = pc;
    for (const track of microphone.getAudioTracks()) {
      track.enabled = false;
      pc.addTransceiver(track, { direction: "sendonly" });
    }
    await negotiate(ws, pc);
    await waitForConnection(pc, CONNECT_TIMEOUT_MS);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.close();
        this.onUpdate({ phase: "idle", level: 0 });
      }
    };
  }

  private setMicrophone(on: boolean): void {
    for (const track of this.microphone?.getAudioTracks() ?? []) track.enabled = on;
  }

  private startMeter(): void {
    const microphone = this.microphone;
    if (!microphone || this.meterFrame !== undefined) return;
    this.audio ??= new AudioContext();
    const analyser = this.audio.createAnalyser();
    analyser.fftSize = 512;
    this.audio.createMediaStreamSource(microphone).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample - 128));
      this.onUpdate({ phase: "talking", level: Math.min(1, peak / 64) });
      this.meterFrame = requestAnimationFrame(tick);
    };
    this.meterFrame = requestAnimationFrame(tick);
  }

  private stopMeter(): void {
    if (this.meterFrame !== undefined) cancelAnimationFrame(this.meterFrame);
    this.meterFrame = undefined;
  }
}

function talkErrorMessage(error: unknown): string {
  const name = (error as { name?: string }).name;
  if (name === "NotAllowedError") return "Allow the microphone for Home Assistant to talk";
  if (name === "NotFoundError") return "No microphone found";
  return errorMessage(error);
}
