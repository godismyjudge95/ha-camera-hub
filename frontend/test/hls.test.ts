import { describe, expect, test } from "bun:test";

import { parseMediaPlaylist, segmentIndexAt, segmentUrl } from "../src/player/hls";

// The shape Frigate's VOD module returns.
const FRIGATE_PLAYLIST = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:13
#EXT-X-MEDIA-SEQUENCE:1
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-MAP:URI="init-v1-a1-x3.mp4"
#EXTINF:13.000,
seg-1-v1-a1-x3.m4s
#EXTINF:10.000,
seg-2-v1-a1-x3.m4s
#EXTINF:9.500,
seg-3-v1-a1-x3.m4s
#EXT-X-ENDLIST
`;

describe("parseMediaPlaylist", () => {
  test("reads the init segment and places each segment on the timeline", () => {
    const playlist = parseMediaPlaylist(FRIGATE_PLAYLIST);

    expect(playlist.initUri).toBe("init-v1-a1-x3.mp4");
    expect(playlist.segments).toEqual([
      { uri: "seg-1-v1-a1-x3.m4s", start: 0, duration: 13 },
      { uri: "seg-2-v1-a1-x3.m4s", start: 13, duration: 10 },
      { uri: "seg-3-v1-a1-x3.m4s", start: 23, duration: 9.5 },
    ]);
    expect(playlist.duration).toBe(32.5);
  });

  test("rejects a response that is not a playlist", () => {
    expect(() => parseMediaPlaylist("<html>Unauthorized</html>")).toThrow("Not an HLS playlist");
  });

  test("rejects a playlist without an fMP4 init segment", () => {
    expect(() => parseMediaPlaylist("#EXTM3U\n#EXTINF:10,\nseg-1.ts\n")).toThrow("init segment");
  });
});

describe("segmentIndexAt", () => {
  const { segments } = parseMediaPlaylist(FRIGATE_PLAYLIST);

  test("finds the segment that holds a time", () => {
    expect(segmentIndexAt(segments, 0)).toBe(0);
    expect(segmentIndexAt(segments, 12.9)).toBe(0);
    expect(segmentIndexAt(segments, 13)).toBe(1);
    expect(segmentIndexAt(segments, 30)).toBe(2);
  });

  test("clamps times past the end to the last segment", () => {
    expect(segmentIndexAt(segments, 99)).toBe(2);
  });
});

describe("segmentUrl", () => {
  test("resolves against the playlist and keeps its signature", () => {
    expect(
      segmentUrl(
        "https://ha.example/api/frigate/frigate/vod/porch/start/1/end/2/index.m3u8?authSig=abc",
        "seg-2-v1-a1-x3.m4s",
      ),
    ).toBe("https://ha.example/api/frigate/frigate/vod/porch/start/1/end/2/seg-2-v1-a1-x3.m4s?authSig=abc");
  });
});
