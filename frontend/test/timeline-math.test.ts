import { describe, expect, test } from "bun:test";

import {
  hoursBetween,
  localDay,
  localTime,
  offsetOf,
  parseRecordingSummary,
  recordedRanges,
  timeAt,
} from "../src/timeline-math";

describe("parseRecordingSummary", () => {
  test("sorts days newest first and hours in order", () => {
    const days = parseRecordingSummary([
      { day: "2026-11-20", hours: [{ hour: "14" }, { hour: "3" }] },
      { day: "2026-11-21", hours: [{ hour: "9" }] },
    ]);

    expect(days).toEqual([
      { day: "2026-11-21", hours: [9] },
      { day: "2026-11-20", hours: [3, 14] },
    ]);
  });
});

describe("recordedRanges", () => {
  test("joins neighbouring hours, also across midnight, newest first", () => {
    const ranges = recordedRanges([
      { day: "2026-11-21", hours: [0, 1, 5] },
      { day: "2026-11-20", hours: [23] },
    ]);

    expect(ranges).toEqual([
      [localTime("2026-11-21", 5), localTime("2026-11-21", 6)],
      [localTime("2026-11-20", 23), localTime("2026-11-21", 2)],
    ]);
  });
});

describe("scale", () => {
  const scale = { top: localTime("2026-11-21", 12), pixelsPerHour: 120 };

  test("places older times further down", () => {
    expect(offsetOf(scale, localTime("2026-11-21", 10))).toBe(240);
  });

  test("turns a position back into a time", () => {
    expect(timeAt(scale, 60)).toBe(localTime("2026-11-21", 12) - 1800);
  });
});

describe("hoursBetween", () => {
  test("lists the full hours, newest first", () => {
    const newest = localTime("2026-11-21", 12) + 25 * 60;
    expect(hoursBetween(newest, localTime("2026-11-21", 10))).toEqual([
      localTime("2026-11-21", 12),
      localTime("2026-11-21", 11),
      localTime("2026-11-21", 10),
    ]);
  });
});

describe("localDay", () => {
  test("names the local date of a time", () => {
    expect(localDay(localTime("2026-11-21", 23) + 3599)).toBe("2026-11-21");
  });
});
