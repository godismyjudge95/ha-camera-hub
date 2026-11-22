// Plays a Frigate recording from its HLS playlist with Media Source
// Extensions. It loads only the segments around the play position, so a
// long time range (for example the last hours, to rewind a live camera)
// costs no more than a short clip. Frigate's segments carry timestamps that
// start at 0 and follow the playlist, so a segment can be appended on its own
// after a seek.
//
// Browsers without MSE that play HLS themselves (Apple's web views) get the
// signed playlist directly: the Frigate integration signs every segment link
// in it.
//
// The first failure ends playback and is the one reported. A decode error,
// for example, closes the media source; the next append then fails with an
// unrelated message, which must not hide the real cause.

import { type MediaPlaylist, parseMediaPlaylist, segmentIndexAt, segmentUrl } from "./hls";
import { describeMediaError, mediaErrorDetails, videoLabel } from "./media-error";
import { codecsFromInitSegment, videoSizeFromInitSegment } from "./mp4-codecs";
import { type AttachedMediaSource, attachMediaSource, hasMediaSource, playsHlsNatively } from "./mse";
import { errorMessage } from "../errors";
import { type LogDetails, logger } from "../log";

const log = logger("recording");

// How far ahead of the play position segments are loaded.
const AHEAD_SECONDS = 30;
// How much already-played video stays in the buffer, for short rewinds.
const BEHIND_SECONDS = 60;

export type VodState = "loading" | "ready" | "error";

export class VodPlayer {
  private playlist?: MediaPlaylist;
  private playlistUrl = "";
  private buffer?: SourceBuffer;
  private attached?: AttachedMediaSource;
  private readonly loaded = new Set<number>();
  private loading = false;
  private closed = false;
  private failed = false;
  private native = false;
  private abort = new AbortController();
  // For messages and the log: the codec and size, and the playlist path
  // without its token.
  private label = "";
  private recording = "";

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly onState: (state: VodState, message?: string) => void,
  ) {}

  get duration(): number {
    if (this.native) return Number.isFinite(this.video.duration) ? this.video.duration : 0;
    return this.playlist?.duration ?? 0;
  }

  // Loads a signed playlist URL and starts playing at `startAt` seconds.
  async load(playlistUrl: string, startAt = 0): Promise<void> {
    this.onState("loading");
    this.recording = new URL(playlistUrl, location.href).pathname;
    this.video.addEventListener("error", this.onVideoError);
    if (!hasMediaSource() && playsHlsNatively(this.video)) {
      await this.loadNative(playlistUrl, startAt);
      return;
    }
    try {
      const response = await this.fetchOrExplain(playlistUrl);
      if (!response.ok) throw new Error(`The recording is not available (HTTP ${response.status})`);
      this.playlist = parseMediaPlaylist(await response.text());
      this.playlistUrl = playlistUrl;
      if (this.playlist.segments.length === 0) throw new Error("There is no recording for this time");

      const init = new Uint8Array(await this.fetchBytes(this.playlist.initUri));
      const codecs = codecsFromInitSegment(init);
      this.label = videoLabel(codecs, videoSizeFromInitSegment(init));
      log.info("Loading a recording", {
        recording: this.recording,
        codecs,
        video: this.label,
        segments: this.playlist.segments.length,
        duration_s: Math.round(this.playlist.duration),
        start_s: Math.round(startAt),
      });
      this.attached = await attachMediaSource(this.video);
      const { mediaSource } = this.attached;
      mediaSource.addEventListener("sourceclose", this.onSourceClose);
      mediaSource.duration = this.playlist.duration;

      const type = `video/mp4; codecs="${codecs}"`;
      if (!this.attached.isTypeSupported(type)) {
        throw new Error(`This device cannot play this video format (${this.label})`);
      }
      this.buffer = mediaSource.addSourceBuffer(type);
      this.buffer.mode = "segments";
      await this.append(init.buffer);

      this.video.addEventListener("timeupdate", this.fill);
      this.video.addEventListener("seeking", this.fill);
      this.video.currentTime = startAt;
      await this.fill();
      this.onState("ready");
      void this.video.play().catch(() => undefined);
    } catch (error) {
      this.fail(error);
    }
  }

  close(): void {
    this.closed = true;
    this.abort.abort();
    this.removeListeners();
    if (this.native) {
      this.video.removeAttribute("src");
      this.video.load();
    }
    this.attached?.detach();
  }

  private removeListeners(): void {
    this.video.removeEventListener("timeupdate", this.fill);
    this.video.removeEventListener("seeking", this.fill);
    this.video.removeEventListener("error", this.onVideoError);
    this.attached?.mediaSource.removeEventListener("sourceclose", this.onSourceClose);
  }

  private readonly onVideoError = () => this.fail(new Error("The video failed"));

  private readonly onSourceClose = () => this.fail(new Error("The browser closed the video player"));

  // Reports the first failure and stops loading. The video's own error, if
  // it has one, is the real cause.
  private fail(error: unknown, details?: LogDetails): void {
    if (this.closed || this.failed) return;
    this.failed = true;
    this.removeListeners();
    const message = describeMediaError(this.video.error, this.label) ?? errorMessage(error);
    log.error(`A recording did not play: ${message}`, {
      recording: this.recording,
      video: this.label,
      cause: errorMessage(error),
      ...mediaErrorDetails(this.video.error),
      source_state: this.attached?.mediaSource.readyState,
      position_s: Math.round(this.video.currentTime),
      ...details,
    });
    this.onState("error", message);
  }

  private async loadNative(playlistUrl: string, startAt: number): Promise<void> {
    this.native = true;
    const video = this.video;
    video.srcObject = null;
    video.src = playlistUrl;
    log.info("Loading a recording over native HLS", { recording: this.recording });
    const loaded = await new Promise<boolean>((resolve) => {
      const done = (ok: boolean) => {
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("error", onError);
        resolve(ok);
      };
      const onLoaded = () => done(true);
      const onError = () => done(false);
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onError);
    });
    if (this.closed || this.failed) return;
    if (!loaded) {
      this.fail(new Error("The recording is not available"));
      return;
    }
    video.currentTime = startAt;
    this.onState("ready");
    void video.play().catch(() => undefined);
  }

  // Appends the segments from the play position to AHEAD_SECONDS ahead.
  private readonly fill = async (): Promise<void> => {
    const playlist = this.playlist;
    if (!playlist || this.loading || this.closed || this.failed) return;
    this.loading = true;
    try {
      const time = this.video.currentTime;
      const first = segmentIndexAt(playlist.segments, time);
      for (let i = first; i < playlist.segments.length; i++) {
        const segment = playlist.segments[i];
        if (segment.start > time + AHEAD_SECONDS) break;
        if (this.loaded.has(i)) continue;
        log.debug("Appending a segment", { recording: this.recording, index: i, start_s: segment.start });
        try {
          await this.append(await this.fetchBytes(segment.uri));
        } catch (error) {
          this.fail(error, { segment: i, segment_start_s: Math.round(segment.start) });
          return;
        }
        this.loaded.add(i);
        // A seek during the download moves the window: start again from there.
        if (Math.abs(this.video.currentTime - time) > segment.duration) break;
      }
      await this.trim();
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading = false;
    }
    // A seek during the download can leave the new position without data.
    const index = segmentIndexAt(playlist.segments, this.video.currentTime);
    if (!this.closed && !this.failed && index >= 0 && !this.loaded.has(index)) void this.fill();
  };

  private async trim(): Promise<void> {
    const playlist = this.playlist;
    const buffer = this.buffer;
    if (!playlist || !buffer) return;
    const keepFrom = this.video.currentTime - BEHIND_SECONDS;
    const keepTo = this.video.currentTime + AHEAD_SECONDS * 2;
    if (keepFrom > 0) await this.remove(0, keepFrom);
    if (keepTo < playlist.duration) await this.remove(keepTo, playlist.duration);
    for (const index of [...this.loaded]) {
      const segment = playlist.segments[index];
      if (segment.start + segment.duration <= keepFrom || segment.start >= keepTo) this.loaded.delete(index);
    }
  }

  private async fetchBytes(uri: string): Promise<ArrayBuffer> {
    const response = await this.fetchOrExplain(segmentUrl(this.playlistUrl, uri));
    if (!response.ok) throw new Error(`A part of the recording did not load (HTTP ${response.status})`);
    return response.arrayBuffer();
  }

  // fetch() rejects with a bare "Failed to fetch" when the network fails.
  private async fetchOrExplain(url: string): Promise<Response> {
    try {
      return await fetch(url, { signal: this.abort.signal });
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") throw error;
      throw new Error(`Could not reach Home Assistant to load the recording (${errorMessage(error)})`);
    }
  }

  private append(data: ArrayBuffer): Promise<void> {
    return this.whenIdle(() => this.buffer!.appendBuffer(data));
  }

  private remove(start: number, end: number): Promise<void> {
    if (end <= start) return Promise.resolve();
    return this.whenIdle(() => this.buffer!.remove(start, end));
  }

  private whenIdle(operation: () => void): Promise<void> {
    const buffer = this.buffer;
    if (!buffer) return Promise.resolve();
    if (this.attached?.mediaSource.readyState !== "open") {
      return Promise.reject(new Error("The browser closed the video player"));
    }
    return new Promise((resolve, reject) => {
      const onEnd = () => {
        buffer.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        buffer.removeEventListener("updateend", onEnd);
        reject(new Error("The browser could not play this part of the recording"));
      };
      buffer.addEventListener("updateend", onEnd, { once: true });
      buffer.addEventListener("error", onError, { once: true });
      try {
        operation();
      } catch (error) {
        buffer.removeEventListener("updateend", onEnd);
        buffer.removeEventListener("error", onError);
        reject(error);
      }
    });
  }
}
