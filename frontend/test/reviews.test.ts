import { describe, expect, test } from "bun:test";

import {
  type Review,
  clipPlaylistPath,
  groupByDay,
  relativeTime,
  reviewDuration,
  reviewLabel,
  reviewMatches,
  thumbnailPath,
  upsertReview,
} from "../src/reviews";

function review(id: string, start: number, objects: string[] = ["person"], end: number | null = start + 5): Review {
  return {
    id,
    camera: "porch",
    start_time: start,
    end_time: end,
    severity: "alert",
    thumb_path: `/media/frigate/clips/review/thumb-porch-${id}.webp`,
    data: { objects, sub_labels: [] },
  };
}

describe("reviewMatches", () => {
  test("sorts objects into people, animals and vehicles", () => {
    expect(reviewMatches(review("a", 1, ["person"]), "person")).toBe(true);
    expect(reviewMatches(review("b", 1, ["cat"]), "animal")).toBe(true);
    expect(reviewMatches(review("c", 1, ["car"]), "vehicle")).toBe(true);
    expect(reviewMatches(review("d", 1, ["cat"]), "person")).toBe(false);
  });

  test("treats Frigate's verified object names like their base object", () => {
    expect(reviewMatches(review("a", 1, ["person-verified"]), "person")).toBe(true);
  });
});

describe("reviewLabel", () => {
  test("prefers a recognised face or plate over the object", () => {
    const item = review("a", 1, ["person"]);
    item.data.sub_labels = ["daniel"];
    expect(reviewLabel(item)).toBe("Daniel");
  });

  test("uses the first object otherwise", () => {
    expect(reviewLabel(review("a", 1, ["dog", "person"]))).toBe("Dog");
  });
});

describe("upsertReview", () => {
  test("puts a new review in order, newest first, within the limit", () => {
    const list = [review("b", 20), review("a", 10)];
    expect(upsertReview(list, review("c", 15), 2).map((item) => item.id)).toEqual(["b", "c"]);
  });

  test("replaces an updated review instead of adding it twice", () => {
    const list = [review("a", 10, ["person"], null)];
    const updated = upsertReview(list, review("a", 10, ["person"], 18), 10);
    expect(updated).toHaveLength(1);
    expect(updated[0].end_time).toBe(18);
  });
});

describe("relativeTime", () => {
  test("uses the largest whole unit", () => {
    const now = 1_000_000_000;
    expect(relativeTime(now / 1000 - 30, now)).toBe("now");
    expect(relativeTime(now / 1000 - 5 * 60, now)).toBe("5m");
    expect(relativeTime(now / 1000 - 3 * 3600, now)).toBe("3h");
    expect(relativeTime(now / 1000 - 2 * 86_400, now)).toBe("2d");
  });
});

describe("media paths", () => {
  test("serve thumbnails through the Frigate integration's clips proxy", () => {
    expect(thumbnailPath("frigate", review("x1", 1))).toBe(
      "/api/frigate/frigate/clips/review/thumb-porch-x1.webp",
    );
  });

  test("ask for the recording with 2 s before and after the review", () => {
    expect(clipPlaylistPath("frigate", review("x1", 100.4, ["person"], 110.2))).toBe(
      "/api/frigate/frigate/vod/porch/start/98/end/113/index.m3u8",
    );
  });

  test("have no clip while the review is still running", () => {
    expect(clipPlaylistPath("frigate", review("x1", 100, ["person"], null))).toBeUndefined();
  });
});

describe("reviewDuration", () => {
  test("shows minutes and seconds, and nothing while the review goes on", () => {
    expect(reviewDuration(review("a", 100, ["person"], 118.4))).toBe("0:18");
    expect(reviewDuration(review("b", 100, ["person"], 825))).toBe("12:05");
    expect(reviewDuration(review("c", 100, ["person"], null))).toBeUndefined();
  });
});

describe("groupByDay", () => {
  test("puts reviews under Today, Yesterday and their date", () => {
    const now = new Date(2026, 10, 21, 15, 0).getTime();
    const at = (day: number, hour: number) => new Date(2026, 10, day, hour, 0).getTime() / 1000;
    const days = groupByDay(
      [review("a", at(21, 14)), review("b", at(21, 9)), review("c", at(20, 22)), review("d", at(18, 8))],
      now,
    );

    const nov18 = new Date(2026, 10, 18).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    expect(days.map((day) => [day.label, day.reviews.map((item) => item.id)])).toEqual([
      ["Today", ["a", "b"]],
      ["Yesterday", ["c"]],
      [nov18, ["d"]],
    ]);
  });
});
