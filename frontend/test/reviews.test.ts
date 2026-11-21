import { describe, expect, test } from "bun:test";

import {
  type Review,
  clipPath,
  relativeTime,
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
    expect(clipPath("frigate", review("x1", 100.4, ["person"], 110.2))).toBe(
      "/api/frigate/frigate/recording/porch/start/98/end/113",
    );
  });

  test("have no clip while the review is still running", () => {
    expect(clipPath("frigate", review("x1", 100, ["person"], null))).toBeUndefined();
  });
});
