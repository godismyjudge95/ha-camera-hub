// Plays a go2rtc stream from Frigate through Home Assistant.
//
// The Frigate integration proxies go2rtc's websocket API, so the card never
// talks to Frigate directly and works both at home and through Home Assistant
// Cloud. MSE is tried first: in tests it started as fast as WebRTC, and it
// also plays high-level H.264 streams (for example 2960x1668 at level 5.0)
// that browsers often do not decode over WebRTC. WebRTC, with the ICE servers
// and TURN relays that Home Assistant provides, is the second choice.
//
// A mode counts only when a frame plays. A connection that delivers no
// picture within FIRST_FRAME_MS makes the player try the next mode.

import { getIceServers } from "../api/ha";
import type { HomeAssistant } from "../ha-types";
import { negotiate, openSocket, send, waitForConnection } from "./go2rtc-socket";
import { liveEdgeAction, supportedCodecs } from "./mse";

import type { StreamSource } from "./go2rtc-socket";

export type { StreamSource } from "./go2rtc-socket";

export type PlayerMode = "webrtc" | "mse";

export type PlayerStatus =
  | { state: "connecting" }
  | { state: "playing"; mode: PlayerMode }
  | { state: "retrying"; inSeconds: number; reason: string };

interface Session {
  mode: PlayerMode;
  close(): void;
}

const MODES: PlayerMode[] = ["mse", "webrtc"];
const WEBRTC_TIMEOUT_MS = 5000;
const FIRST_FRAME_MS = 6000;
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
    let reason = "No video arrived";
    for (const mode of MODES) {
      let session: Session;
      try {
        session = await startSession(mode, this.getHass(), source, this.video, onEnded);
      } catch (error) {
        if (!isCurrent()) return;
        reason = error instanceof Error ? error.message : String(error);
        continue;
      }
      if (!isCurrent()) {
        session.close();
        return;
      }
      this.session = session;
      const played = await waitForFirstFrame(this.video, FIRST_FRAME_MS);
      if (!isCurrent() || played) return;
      session.close();
      this.session = undefined;
      reason = `No video arrived over ${mode.toUpperCase()}`;
    }
    onEnded(reason);
  }

  private retry(reason: string): void {
    this.session?.close();
    this.session = undefined;
    const delay = Math.min(MAX_RETRY_MS, 1000 * 2 ** this.attempt++);
    this.onStatus({ state: "retrying", inSeconds: Math.round(delay / 1000), reason });
    this.retryTimer = setTimeout(() => void this.connect(), delay);
  }
}

function startSession(
  mode: PlayerMode,
  hass: HomeAssistant,
  source: StreamSource,
  video: HTMLVideoElement,
  onEnded: (reason: string) => void,
): Promise<Session> {
  return mode === "mse"
    ? startMse(hass, source, video, onEnded)
    : startWebRtc(hass, source, video, onEnded);
}

function waitForFirstFrame(video: HTMLVideoElement, timeoutMs: number): Promise<boolean> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const done = (played: boolean) => {
      clearTimeout(timer);
      video.removeEventListener("playing", onPlaying);
      resolve(played);
    };
    const onPlaying = () => done(true);
    const timer = setTimeout(() => done(false), timeoutMs);
    video.addEventListener("playing", onPlaying);
  });
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
  await negotiate(ws, pc);

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
