// Plays a go2rtc stream from Frigate through Home Assistant.
//
// The Frigate integration proxies go2rtc's websocket API, so the card never
// talks to Frigate directly and works both at home and through Home Assistant
// Cloud. WebRTC is tried first, with the ICE servers (and TURN relays) that
// Home Assistant provides. If WebRTC does not connect in time, the player uses
// MSE over the same proxied websocket.

import { getIceServers, signPath } from "../api/ha";
import type { HomeAssistant } from "../ha-types";
import { liveEdgeAction, supportedCodecs } from "./mse";

export interface StreamSource {
  instanceId: string;
  stream: string;
  // A Frigate camera entity, used to ask Home Assistant for ICE servers.
  iceEntityId: string;
}

export type PlayerMode = "webrtc" | "mse";

export type PlayerStatus =
  | { state: "connecting" }
  | { state: "playing"; mode: PlayerMode }
  | { state: "retrying"; inSeconds: number; reason: string };

interface Session {
  mode: PlayerMode;
  close(): void;
}

const WEBRTC_TIMEOUT_MS = 5000;
const MAX_RETRY_MS = 30_000;

export class LivePlayer {
  private source?: StreamSource;
  private session?: Session;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private attempt = 0;
  // Each connection attempt gets a new generation, so a slow, outdated
  // attempt cannot replace the current one.
  private generation = 0;

  constructor(
    private readonly getHass: () => HomeAssistant,
    private readonly video: HTMLVideoElement,
    private readonly onStatus: (status: PlayerStatus) => void,
  ) {
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.addEventListener("playing", () => {
      if (this.session) {
        this.attempt = 0;
        this.onStatus({ state: "playing", mode: this.session.mode });
      }
    });
  }

  play(source: StreamSource): void {
    this.stop();
    this.source = source;
    this.attempt = 0;
    void this.connect();
  }

  stop(): void {
    this.generation++;
    clearTimeout(this.retryTimer);
    this.session?.close();
    this.session = undefined;
    this.source = undefined;
  }

  private async connect(): Promise<void> {
    const source = this.source;
    if (!source) return;
    const generation = ++this.generation;
    const isCurrent = () => generation === this.generation;
    const onEnded = (reason: string) => {
      if (isCurrent()) this.retry(reason);
    };

    this.onStatus({ state: "connecting" });
    try {
      let session: Session;
      try {
        session = await startWebRtc(this.getHass(), source, this.video, onEnded);
      } catch {
        if (!isCurrent()) return;
        session = await startMse(this.getHass(), source, this.video, onEnded);
      }
      if (!isCurrent()) {
        session.close();
        return;
      }
      this.session = session;
    } catch (error) {
      onEnded(error instanceof Error ? error.message : String(error));
    }
  }

  private retry(reason: string): void {
    this.session?.close();
    this.session = undefined;
    const delay = Math.min(MAX_RETRY_MS, 1000 * 2 ** this.attempt++);
    this.onStatus({ state: "retrying", inSeconds: Math.round(delay / 1000), reason });
    this.retryTimer = setTimeout(() => void this.connect(), delay);
  }
}

async function openSocket(hass: HomeAssistant, source: StreamSource): Promise<WebSocket> {
  const path =
    `/api/frigate/${encodeURIComponent(source.instanceId)}/go2rtc/ws/api/ws` +
    `?src=${encodeURIComponent(source.stream)}`;
  const url = (await signPath(hass, path)).replace(/^http/, "ws");
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";
  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("Could not open the stream connection"));
  });
  ws.onerror = null;
  return ws;
}

function send(ws: WebSocket, type: string, value: string): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, value }));
}

async function startWebRtc(
  hass: HomeAssistant,
  source: StreamSource,
  video: HTMLVideoElement,
  onEnded: (reason: string) => void,
): Promise<Session> {
  const [iceServers, ws] = await Promise.all([
    getIceServers(hass, source.iceEntityId),
    openSocket(hass, source),
  ]);
  const pc = new RTCPeerConnection({ iceServers });
  let closed = false;
  const close = () => {
    closed = true;
    pc.close();
    ws.close();
    if (video.srcObject) video.srcObject = null;
  };

  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });
  const media = new MediaStream();
  pc.ontrack = (event) => {
    media.addTrack(event.track);
    if (video.srcObject !== media) {
      video.removeAttribute("src");
      video.srcObject = media;
    }
  };
  pc.onicecandidate = (event) => send(ws, "webrtc/candidate", event.candidate?.candidate ?? "");

  ws.onmessage = (event) => {
    if (typeof event.data !== "string") return;
    const message = JSON.parse(event.data) as { type: string; value: string };
    if (message.type === "webrtc/answer") {
      void pc.setRemoteDescription({ type: "answer", sdp: message.value });
    } else if (message.type === "webrtc/candidate" && message.value) {
      void pc.addIceCandidate({ candidate: message.value, sdpMid: "0" });
    } else if (message.type === "error") {
      pc.close();
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  send(ws, "webrtc/offer", offer.sdp ?? "");

  try {
    await waitForConnection(pc, WEBRTC_TIMEOUT_MS);
  } catch (error) {
    close();
    throw error;
  }

  const ended = (reason: string) => {
    if (!closed) {
      close();
      onEnded(reason);
    }
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") {
      ended("The WebRTC connection was lost");
    }
  };
  ws.onclose = () => ended("The stream connection closed");
  return { mode: "webrtc", close };
}

function waitForConnection(pc: RTCPeerConnection, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WebRTC timed out")), timeoutMs);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        clearTimeout(timer);
        resolve();
      } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        clearTimeout(timer);
        reject(new Error("WebRTC failed"));
      }
    };
  });
}

type MediaSourceClass = typeof MediaSource;

async function startMse(
  hass: HomeAssistant,
  source: StreamSource,
  video: HTMLVideoElement,
  onEnded: (reason: string) => void,
): Promise<Session> {
  // iOS has only ManagedMediaSource, which needs remote playback disabled.
  const managed = (window as unknown as { ManagedMediaSource?: MediaSourceClass })
    .ManagedMediaSource;
  const MediaSourceType = managed ?? window.MediaSource;
  if (!MediaSourceType) throw new Error("This browser cannot play the stream");

  const ws = await openSocket(hass, source);
  const mediaSource = new MediaSourceType();
  if (managed) video.disableRemotePlayback = true;
  video.srcObject = null;
  const objectUrl = URL.createObjectURL(mediaSource);
  video.src = objectUrl;

  let closed = false;
  const close = () => {
    closed = true;
    ws.close();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  };
  const ended = (reason: string) => {
    if (!closed) {
      close();
      onEnded(reason);
    }
  };

  await new Promise((resolve) =>
    mediaSource.addEventListener("sourceopen", resolve, { once: true }),
  );
  send(ws, "mse", supportedCodecs((type) => MediaSourceType.isTypeSupported(type)));

  let buffer: SourceBuffer | undefined;
  const queue: ArrayBuffer[] = [];
  const pump = () => {
    if (!buffer || buffer.updating || closed) return;
    const next = queue.shift();
    if (next) {
      buffer.appendBuffer(next);
      return;
    }
    if (buffer.buffered.length === 0) return;
    const action = liveEdgeAction(
      video.currentTime,
      buffer.buffered.start(0),
      buffer.buffered.end(buffer.buffered.length - 1),
    );
    if (action.seekTo !== undefined) video.currentTime = action.seekTo;
    if (action.removeEnd !== undefined) buffer.remove(0, action.removeEnd);
  };

  ws.onmessage = (event) => {
    if (typeof event.data === "string") {
      const message = JSON.parse(event.data) as { type: string; value: string };
      if (message.type === "mse") {
        buffer = mediaSource.addSourceBuffer(message.value);
        buffer.mode = "segments";
        buffer.addEventListener("updateend", pump);
      } else if (message.type === "error") {
        ended(message.value);
      }
      return;
    }
    queue.push(event.data as ArrayBuffer);
    pump();
  };
  ws.onclose = () => ended("The stream connection closed");
  return { mode: "mse", close };
}
