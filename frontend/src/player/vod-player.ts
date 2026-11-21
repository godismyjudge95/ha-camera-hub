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

import { type MediaPlaylist, parseMediaPlaylist, segmentIndexAt, segmentUrl } from "./hls";
import { codecsFromInitSegment } from "./mp4-codecs";
import { type AttachedMediaSource, attachMediaSource, hasMediaSource, playsHlsNatively } from "./mse";
import { errorMessage } from "../errors";

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
  private native = false;
  private abort = new AbortController();

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
    if (!hasMediaSource() && playsHlsNatively(this.video)) {
      await this.loadNative(playlistUrl, startAt);
      return;
    }
    try {
      const response = await fetch(playlistUrl, { signal: this.abort.signal });
      if (!response.ok) throw new Error(`The recording is not available (${response.status})`);
      this.playlist = parseMediaPlaylist(await response.text());
      this.playlistUrl = playlistUrl;
      if (this.playlist.segments.length === 0) throw new Error("There is no recording for this time");

      const init = new Uint8Array(await this.fetchBytes(this.playlist.initUri));
      this.attached = await attachMediaSource(this.video);
      const { mediaSource } = this.attached;
      mediaSource.duration = this.playlist.duration;

      this.buffer = mediaSource.addSourceBuffer(`video/mp4; codecs="${codecsFromInitSegment(init)}"`);
      this.buffer.mode = "segments";
      await this.append(init.buffer);

      this.video.addEventListener("timeupdate", this.fill);
      this.video.addEventListener("seeking", this.fill);
      this.video.currentTime = startAt;
      await this.fill();
      this.onState("ready");
      void this.video.play().catch(() => undefined);
    } catch (error) {
      if (this.closed) return;
      this.onState("error", errorMessage(error));
    }
  }

  close(): void {
    this.closed = true;
    this.abort.abort();
    this.video.removeEventListener("timeupdate", this.fill);
    this.video.removeEventListener("seeking", this.fill);
    if (this.native) {
      this.video.removeAttribute("src");
      this.video.load();
    }
    this.attached?.detach();
  }

  private async loadNative(playlistUrl: string, startAt: number): Promise<void> {
    this.native = true;
    const video = this.video;
    video.srcObject = null;
    video.src = playlistUrl;
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
    if (this.closed) return;
    if (!loaded) {
      this.onState("error", "The recording is not available");
      return;
    }
    video.currentTime = startAt;
    this.onState("ready");
    void video.play().catch(() => undefined);
  }

  // Appends the segments from the play position to AHEAD_SECONDS ahead.
  private readonly fill = async (): Promise<void> => {
    const playlist = this.playlist;
    if (!playlist || this.loading || this.closed) return;
    this.loading = true;
    try {
      const time = this.video.currentTime;
      const first = segmentIndexAt(playlist.segments, time);
      for (let i = first; i < playlist.segments.length; i++) {
        const segment = playlist.segments[i];
        if (segment.start > time + AHEAD_SECONDS) break;
        if (this.loaded.has(i)) continue;
        await this.append(await this.fetchBytes(segment.uri));
        this.loaded.add(i);
        // A seek during the download moves the window: start again from there.
        if (Math.abs(this.video.currentTime - time) > segment.duration) break;
      }
      await this.trim();
    } catch (error) {
      if (!this.closed) this.onState("error", errorMessage(error));
    } finally {
      this.loading = false;
    }
    // A seek during the download can leave the new position without data.
    const index = segmentIndexAt(playlist.segments, this.video.currentTime);
    if (!this.closed && index >= 0 && !this.loaded.has(index)) void this.fill();
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
    const response = await fetch(segmentUrl(this.playlistUrl, uri), { signal: this.abort.signal });
    if (!response.ok) throw new Error(`A part of the recording did not load (${response.status})`);
    return response.arrayBuffer();
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
      operation();
    });
  }
}
