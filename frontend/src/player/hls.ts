// A reader for the HLS media playlists Frigate serves for its recordings
// (`/vod/<camera>/start/<s>/end/<e>/index.m3u8`). They are video-on-demand
// playlists with fMP4 segments and one init segment, which MSE plays as they
// are. Master playlists, live playlists and MPEG-TS are out of scope.

export interface Segment {
  uri: string;
  // Seconds from the start of the playlist.
  start: number;
  duration: number;
}

export interface MediaPlaylist {
  initUri: string;
  segments: Segment[];
  duration: number;
}

export function parseMediaPlaylist(text: string): MediaPlaylist {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  if (lines[0] !== "#EXTM3U") throw new Error("Not an HLS playlist");

  let initUri: string | undefined;
  let pendingDuration: number | undefined;
  let position = 0;
  const segments: Segment[] = [];

  for (const line of lines) {
    if (line.startsWith("#EXT-X-MAP:")) {
      initUri = /URI="([^"]+)"/.exec(line)?.[1];
    } else if (line.startsWith("#EXTINF:")) {
      pendingDuration = Number.parseFloat(line.slice("#EXTINF:".length));
    } else if (line && !line.startsWith("#") && pendingDuration !== undefined) {
      segments.push({ uri: line, start: position, duration: pendingDuration });
      position += pendingDuration;
      pendingDuration = undefined;
    }
  }

  if (!initUri) throw new Error("The playlist has no fMP4 init segment");
  return { initUri, segments, duration: position };
}

// The index of the segment that holds `time`, clamped to the playlist.
export function segmentIndexAt(segments: Segment[], time: number): number {
  if (segments.length === 0) return -1;
  let low = 0;
  let high = segments.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (segments[middle].start <= time) low = middle;
    else high = middle - 1;
  }
  return low;
}

// Resolves a segment URI against the playlist URL and carries the playlist's
// signature over: the Frigate integration accepts a segment request when it
// has the signature of the playlist in the same folder.
export function segmentUrl(playlistUrl: string, uri: string): string {
  const playlist = new URL(playlistUrl);
  const url = new URL(uri, playlist);
  const signature = playlist.searchParams.get("authSig");
  if (signature && !url.searchParams.has("authSig")) url.searchParams.set("authSig", signature);
  return url.toString();
}
