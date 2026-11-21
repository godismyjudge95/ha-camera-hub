// Media Source Extensions helpers for go2rtc's MSE mode.
//
// The codec list and the idea of trimming the buffer near the live edge come
// from go2rtc's video-rtc.js (https://github.com/AlexxIT/go2rtc, MIT license,
// Copyright (c) 2022 Alexey Khit).

const CODECS = [
  "avc1.640029", // H.264 high 4.1
  "avc1.64002A", // H.264 high 4.2
  "avc1.640033", // H.264 high 5.1
  "hvc1.1.6.L153.B0", // H.265 main 5.1
  "mp4a.40.2", // AAC LC
  "mp4a.40.5", // AAC HE
  "flac",
  "opus",
];

type MediaSourceClass = typeof MediaSource;

// True if the browser has Media Source Extensions in either form.
export function hasMediaSource(): boolean {
  const w = window as unknown as { ManagedMediaSource?: unknown; MediaSource?: unknown };
  return Boolean(w.ManagedMediaSource ?? w.MediaSource);
}

// True if the video element plays HLS by itself (Apple's browsers and apps).
export function playsHlsNatively(video: HTMLVideoElement): boolean {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}

export interface AttachedMediaSource {
  mediaSource: MediaSource;
  isTypeSupported(type: string): boolean;
  detach(): void;
}

const SOURCE_OPEN_MS = 5000;

// Creates a media source on `video` and waits until it opens.
// WebKit (Safari, iOS, and the Home Assistant apps for Apple devices) has
// ManagedMediaSource, which must be attached with `srcObject` and needs
// remote playback off; other browsers take MediaSource through an object URL.
export async function attachMediaSource(video: HTMLVideoElement): Promise<AttachedMediaSource> {
  const managed = (window as unknown as { ManagedMediaSource?: MediaSourceClass }).ManagedMediaSource;
  const Type = managed ?? window.MediaSource;
  if (!Type) throw new Error("This browser cannot play the stream");
  const mediaSource = new Type();
  let objectUrl: string | undefined;
  if (managed) {
    video.disableRemotePlayback = true;
    video.removeAttribute("src");
    video.srcObject = mediaSource;
  } else {
    video.srcObject = null;
    objectUrl = URL.createObjectURL(mediaSource);
    video.src = objectUrl;
  }
  const detach = () => {
    if (managed) video.srcObject = null;
    else video.removeAttribute("src");
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
  const opened = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), SOURCE_OPEN_MS);
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        clearTimeout(timer);
        resolve(true);
      },
      { once: true },
    );
  });
  if (!opened) {
    detach();
    throw new Error("This browser did not open the video player");
  }
  return { mediaSource, isTypeSupported: (type) => Type.isTypeSupported(type), detach };
}

// go2rtc picks the stream codecs from this comma-separated list.
export function supportedCodecs(isTypeSupported: (type: string) => boolean): string {
  return CODECS.filter((codec) => isTypeSupported(`video/mp4; codecs="${codec}"`)).join();
}

export interface BufferAction {
  seekTo?: number;
  removeEnd?: number;
}

// Keep playback close to live and the buffer small. A live view that falls
// behind (for example after the tab was in the background) jumps forward
// instead of playing old video.
export function liveEdgeAction(
  currentTime: number,
  bufferStart: number,
  bufferEnd: number,
): BufferAction {
  const action: BufferAction = {};
  if (bufferEnd - currentTime > 3) {
    action.seekTo = bufferEnd - 0.5;
  } else if (currentTime < bufferStart) {
    // A stream's first data can start a little after 0. The browser does not
    // always skip that gap, and the video would wait in front of it.
    action.seekTo = bufferStart;
  }
  const playhead = action.seekTo ?? currentTime;
  if (playhead - bufferStart > 10) {
    action.removeEnd = playhead - 5;
  }
  return action;
}
