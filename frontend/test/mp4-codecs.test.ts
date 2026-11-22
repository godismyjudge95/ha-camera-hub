import { describe, expect, test } from "bun:test";

import { codecsFromInitSegment, videoSizeFromInitSegment } from "../src/player/mp4-codecs";

// Init segments from Frigate's VOD module, for an Amcrest camera
// (2960x1668, H.264 Main level 5.0) and a Thingino camera (level 4.1).
const fixture = async (name: string) =>
  new Uint8Array(await Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).arrayBuffer());

describe("codecsFromInitSegment", () => {
  test("reads H.264 profile and level and AAC from a real init segment", async () => {
    expect(codecsFromInitSegment(await fixture("init-front_yard.mp4"))).toBe(
      "avc1.4D0032,mp4a.40.2",
    );
    expect(codecsFromInitSegment(await fixture("init-nursery.mp4"))).toBe("avc1.4D0029,mp4a.40.2");
  });

  test("rejects data without a known codec", () => {
    expect(() => codecsFromInitSegment(new Uint8Array([1, 2, 3, 4]))).toThrow("no known codec");
  });
});

describe("videoSizeFromInitSegment", () => {
  test("reads the picture size from a real init segment", async () => {
    expect(videoSizeFromInitSegment(await fixture("init-front_yard.mp4"))).toEqual({ width: 2960, height: 1668 });
  });

  test("returns undefined without a video sample entry", () => {
    expect(videoSizeFromInitSegment(new Uint8Array([1, 2, 3, 4]))).toBeUndefined();
  });
});
