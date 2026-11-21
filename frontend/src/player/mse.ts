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
  }
  const playhead = action.seekTo ?? currentTime;
  if (playhead - bufferStart > 10) {
    action.removeEnd = playhead - 5;
  }
  return action;
}
