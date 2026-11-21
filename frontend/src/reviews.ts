// Frigate review items (alerts) as the card lists them. Pure functions only,
// so the list behaviour is testable without a browser.

export interface Review {
  id: string;
  camera: string;
  start_time: number;
  end_time: number | null;
  severity: "alert" | "detection";
  thumb_path: string;
  data: {
    objects: string[];
    sub_labels: string[];
  };
}

// A Frigate `reviews` MQTT message, as `frigate/reviews/subscribe` relays it.
export interface ReviewMessage {
  type: "new" | "update" | "end";
  after: Review;
}

export type ReviewFilter = "all" | "person" | "animal" | "vehicle";

const ANIMALS = new Set(["cat", "dog", "bird", "horse", "deer", "bear", "raccoon", "fox", "squirrel"]);
const VEHICLES = new Set(["car", "motorcycle", "bicycle", "bus", "truck", "boat"]);

export function reviewMatches(review: Review, filter: ReviewFilter): boolean {
  const objects = review.data.objects.map((object) => object.split("-")[0]);
  switch (filter) {
    case "all":
      return true;
    case "person":
      return objects.includes("person");
    case "animal":
      return objects.some((object) => ANIMALS.has(object));
    case "vehicle":
      return objects.some((object) => VEHICLES.has(object));
  }
}

// The label a thumbnail shows, for example "Person" or "Cat".
export function reviewLabel(review: Review): string {
  const object = review.data.sub_labels[0] ?? review.data.objects[0] ?? "Motion";
  const name = object.replace(/[-_]/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Adds or replaces a review, newest first, and keeps at most `limit` items.
export function upsertReview(reviews: Review[], review: Review, limit: number): Review[] {
  const rest = reviews.filter((item) => item.id !== review.id);
  return [review, ...rest].sort((a, b) => b.start_time - a.start_time).slice(0, limit);
}

// Short relative time for a thumbnail: "now", "5m", "3h", "2d".
export function relativeTime(epochSeconds: number, nowMs: number): string {
  const seconds = Math.max(0, nowMs / 1000 - epochSeconds);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}

// The Frigate integration serves review thumbnails under its clips proxy.
export function thumbnailPath(instanceId: string, review: Review): string {
  const relative = review.thumb_path.replace(/^\/media\/frigate\//, "");
  return `/api/frigate/${encodeURIComponent(instanceId)}/${relative}`;
}

// The HLS playlist of a camera's recording between two times (epoch seconds).
export function recordingPlaylistPath(
  instanceId: string,
  camera: string,
  start: number,
  end: number,
): string {
  return (
    `/api/frigate/${encodeURIComponent(instanceId)}/vod/${encodeURIComponent(camera)}` +
    `/start/${Math.floor(start)}/end/${Math.ceil(end)}/index.m3u8`
  );
}

// The recording of a review, with a little time before and after.
export function clipPlaylistPath(instanceId: string, review: Review): string | undefined {
  if (review.end_time === null) return undefined;
  return recordingPlaylistPath(instanceId, review.camera, review.start_time - 2, review.end_time + 2);
}
