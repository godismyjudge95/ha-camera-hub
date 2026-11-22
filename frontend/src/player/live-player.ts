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
//
// Some devices cannot decode a camera's main stream (for example an older
// tablet and a 2304x1296 stream). If the main stream fails, the player tries
// the camera's smaller fallback stream and remembers, until the page
// reloads, to start that camera on the fallback stream.

import { getCameraHlsUrl, getIceServers } from "../api/ha";
import type { HomeAssistant } from "../ha-types";
import { negotiate, openSocket, send, waitForConnection } from "./go2rtc-socket";
import {
  type AttachedMediaSource,
  attachMediaSource,
  hasMediaSource,
  liveEdgeAction,
  playsHlsNatively,
  supportedCodecs,
} from "./mse";

import type { StreamSource } from "./go2rtc-socket";
import { errorMessage } from "../errors";
import { logger } from "../log";
import { mediaErrorDetails } from "./media-error";

const log = logger("live");

export type { StreamSource } from "./go2rtc-socket";

export type PlayerMode = "webrtc" | "mse" | "hls";

export type PlayerStatus =
  | { state: "connecting" }
  | { state: "playing"; mode: PlayerMode }
  | { state: "retrying"; inSeconds: number; reason: string };

interface Session {
  mode: PlayerMode;
  close(): void;
}

// The modes this browser can use, in order. Some web views (for example the
// Home Assistant app for macOS) have neither MSE nor WebRTC; they play Home
// Assistant's own HLS stream, which starts slower and runs a few seconds
// behind live.
function availableModes(video: HTMLVideoElement): PlayerMode[] {
  const modes: PlayerMode[] = [];
  if (hasMediaSource()) modes.push("mse");
  if (typeof RTCPeerConnection !== "undefined") modes.push("webrtc");
  if (!hasMediaSource() && playsHlsNatively(video)) modes.push("hls");
  return modes;
}

const WEBRTC_TIMEOUT_MS = 5000;
const FIRST_FRAME_MS = 6000;
// Home Assistant starts its HLS stream on demand, which takes longer.
const HLS_FIRST_FRAME_MS = 20_000;
const MAX_RETRY_MS = 30_000;
// The reason a session gives when the browser cannot decode the stream.
// Another mode cannot help then, so the player goes to the fallback stream.
const DECODE_ERROR = "This device cannot decode the stream";

// Main streams that failed on this device and the fallback that played.
const undecodable = new Set<string>();

export class LivePlayer {
  private source?: StreamSource;
  private fallbackStream?: string;
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

  play(source: StreamSource, fallbackStream?: string | null): void {
    this.stop();
    this.source = source;
    this.fallbackStream = fallbackStream ?? undefined;
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
    // While a session starts, its failure ends the wait for the first frame
    // instead of starting a retry.
    let startFailed: ((reason: string) => void) | undefined;
    const sessionEnded = (reason: string) => {
      if (startFailed) startFailed(reason);
      else onEnded(reason);
    };

    const fallback = this.fallbackStream;
    const streams = fallback && undecodable.has(source.stream) ? [fallback] : [source.stream];
    if (fallback && !streams.includes(fallback)) streams.push(fallback);

    this.onStatus({ state: "connecting" });
    let reason = "No video arrived";
    for (const stream of streams) {
      for (const mode of availableModes(this.video)) {
        // Home Assistant's HLS stream has one quality: try it once.
        if (mode === "hls" && stream !== streams[0]) continue;
        log.debug("Starting", { stream, mode });
        let session: Session;
        try {
          session = await startSession(mode, this.getHass(), { ...source, stream }, this.video, sessionEnded);
        } catch (error) {
          if (!isCurrent()) return;
          reason = errorMessage(error);
          log.info(`${stream} did not start over ${mode}: ${reason}`);
          continue;
        }
        if (!isCurrent()) {
          session.close();
          return;
        }
        this.session = session;
        const result = await new Promise<true | string>((resolve) => {
          startFailed = resolve;
          void waitForFirstFrame(this.video, mode === "hls" ? HLS_FIRST_FRAME_MS : FIRST_FRAME_MS).then((played) =>
            resolve(played ? true : `No video arrived over ${mode.toUpperCase()}`),
          );
        });
        startFailed = undefined;
        if (!isCurrent()) return;
        if (result === true) {
          log.info(`Playing ${stream} over ${mode}`);
          if (stream !== source.stream) {
            undecodable.add(source.stream);
            log.warn(`This device cannot play ${source.stream}; it plays the smaller stream ${stream}`);
          }
          return;
        }
        session.close();
        this.session = undefined;
        reason = result;
        log.info(`${stream} gave no picture over ${mode}: ${reason}`);
        if (reason === DECODE_ERROR) break;
      }
    }
    onEnded(reason);
  }

  private retry(reason: string): void {
    this.session?.close();
    this.session = undefined;
    const delay = Math.min(MAX_RETRY_MS, 1000 * 2 ** this.attempt++);
    log.warn(`Live video of ${this.source?.stream} failed: ${reason}`, {
      retry_in_s: delay / 1000,
      attempt: this.attempt,
    });
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
  if (mode === "mse") return startMse(hass, source, video, onEnded);
  if (mode === "webrtc") return startWebRtc(hass, source, video, onEnded);
  return startHls(hass, source, video, onEnded);
}

async function startHls(
  hass: HomeAssistant,
  source: StreamSource,
  video: HTMLVideoElement,
  onEnded: (reason: string) => void,
): Promise<Session> {
  const url = await getCameraHlsUrl(hass, source.iceEntityId);
  let closed = false;
  const onError = () => {
    if (closed) return;
    log.warn(`Home Assistant's HLS stream of ${source.iceEntityId} failed`, mediaErrorDetails(video.error));
    close();
    onEnded("The stream stopped");
  };
  const close = () => {
    closed = true;
    video.removeEventListener("error", onError);
    video.removeAttribute("src");
    video.load();
  };
  video.srcObject = null;
  video.addEventListener("error", onError);
  video.src = url;
  void video.play().catch(() => undefined);
  return { mode: "hls", close };
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
      ended(`The WebRTC connection was lost (${pc.connectionState})`);
    }
  };
  ws.onclose = (event) => ended(`The stream connection closed (code ${event.code})`);
  return { mode: "webrtc", close };
}

async function startMse(
  hass: HomeAssistant,
  source: StreamSource,
  video: HTMLVideoElement,
  onEnded: (reason: string) => void,
): Promise<Session> {
  const ws = await openSocket(hass, source);
  let attached: AttachedMediaSource;
  try {
    attached = await attachMediaSource(video);
  } catch (error) {
    ws.close();
    throw error;
  }
  const { mediaSource, isTypeSupported } = attached;

  let closed = false;
  let codecs = "";
  // The browser could not use the data: log what it says, then end.
  const decodeFailed = (cause: string) => {
    if (closed) return;
    log.warn(`This device could not decode ${source.stream}: ${cause}`, {
      codecs,
      ...mediaErrorDetails(video.error),
      source_state: mediaSource.readyState,
    });
    ended(DECODE_ERROR);
  };
  const onVideoError = () => decodeFailed("the video failed");
  const onSourceClose = () => decodeFailed("the browser closed the video player");
  const close = () => {
    closed = true;
    ws.close();
    video.removeEventListener("error", onVideoError);
    mediaSource.removeEventListener("sourceclose", onSourceClose);
    attached.detach();
  };
  const ended = (reason: string) => {
    if (!closed) {
      close();
      onEnded(reason);
    }
  };
  // A decode error makes the browser close the media source. Stop then,
  // instead of adding more data to it.
  video.addEventListener("error", onVideoError);
  mediaSource.addEventListener("sourceclose", onSourceClose);
  send(ws, "mse", supportedCodecs(isTypeSupported));

  let buffer: SourceBuffer | undefined;
  const queue: ArrayBuffer[] = [];
  const pump = () => {
    if (!buffer || buffer.updating || closed) return;
    if (mediaSource.readyState !== "open") {
      decodeFailed("the video player closed");
      return;
    }
    const next = queue.shift();
    if (next) {
      try {
        buffer.appendBuffer(next);
      } catch (error) {
        decodeFailed(`adding data failed (${errorMessage(error)})`);
      }
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
        codecs = message.value;
        if (!isTypeSupported(message.value)) {
          decodeFailed(`the codecs are not supported`);
          return;
        }
        buffer = mediaSource.addSourceBuffer(message.value);
        buffer.mode = "segments";
        buffer.addEventListener("updateend", pump);
      } else if (message.type === "error") {
        ended(`go2rtc: ${message.value}`);
      }
      return;
    }
    queue.push(event.data as ArrayBuffer);
    pump();
  };
  ws.onclose = (event) => ended(`The stream connection closed (code ${event.code})`);
  return { mode: "mse", close };
}
