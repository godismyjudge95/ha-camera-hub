// Readable reasons for a failed <video>.
//
// When the browser cannot decode a stream, it sets `video.error` and closes
// the media source. Later calls on the media source then fail with messages
// such as "This SourceBuffer has been removed from the parent media source".
// Those messages hide the cause, so the players report `video.error` first.

// What the player knows about the video, for example "H.264, 2304×1296".
export function videoLabel(codecs: string | undefined, size?: { width: number; height: number }): string {
  const video = codecs?.split(",")[0] ?? "";
  const codec = video.startsWith("avc1")
    ? "H.264"
    : video.startsWith("hvc1") || video.startsWith("hev1")
      ? "H.265"
      : video;
  return [codec, size ? `${size.width}×${size.height}` : ""].filter(Boolean).join(", ");
}

// A message for the user, or undefined if the video has no error.
export function describeMediaError(error: MediaError | null, label = ""): string | undefined {
  if (!error) return undefined;
  const about = label ? ` (${label})` : "";
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return "The video stopped loading";
    case MediaError.MEDIA_ERR_NETWORK:
      return "The video stopped because of a network error";
    case MediaError.MEDIA_ERR_DECODE:
      return `This device cannot decode this video${about}`;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return `This device cannot play this video format${about}`;
    default:
      return `The video failed${about}`;
  }
}

// The browser's own details, for the log.
export function mediaErrorDetails(error: MediaError | null): Record<string, unknown> {
  return error ? { media_error_code: error.code, media_error: error.message } : {};
}
