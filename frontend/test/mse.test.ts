import { describe, expect, test } from "bun:test";

import { liveEdgeAction, supportedCodecs } from "../src/player/mse";

describe("supportedCodecs", () => {
  test("offers only the codecs the browser can play, in go2rtc's order", () => {
    const playable = new Set(['video/mp4; codecs="avc1.640029"', 'video/mp4; codecs="opus"']);
    expect(supportedCodecs((type) => playable.has(type))).toBe("avc1.640029,opus");
  });
});

describe("liveEdgeAction", () => {
  test("does nothing while playback is near live and the buffer is small", () => {
    expect(liveEdgeAction(4.8, 0, 5)).toEqual({});
  });

  test("jumps forward when playback falls behind live", () => {
    expect(liveEdgeAction(2, 0, 8)).toEqual({ seekTo: 7.5 });
  });

  test("drops old video once more than 10 s is buffered behind the playhead", () => {
    expect(liveEdgeAction(30, 15, 30.5)).toEqual({ removeEnd: 25 });
  });

  test("moves into the buffer when the stream starts after 0", () => {
    expect(liveEdgeAction(0, 0.4, 1.2)).toEqual({ seekTo: 0.4 });
  });

  test("trims relative to the new position after a jump", () => {
    expect(liveEdgeAction(5, 0, 20)).toEqual({ seekTo: 19.5, removeEnd: 14.5 });
  });
});
