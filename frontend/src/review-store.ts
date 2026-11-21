import { getReviews, subscribeReviews } from "./api/frigate";
import type { HomeAssistant } from "./ha-types";
import { type Review, upsertReview } from "./reviews";

const HOURS = 24;
const LIMIT = 60;

// The recent Frigate alerts of the hub's cameras, shared by the alert list
// and the rewind timeline. It loads the last day once and then follows
// Frigate's review messages.
export class ReviewStore {
  reviews: Review[] = [];
  error: string | undefined;
  readonly hours = HOURS;

  private readonly listeners = new Set<() => void>();
  private unsubscribe?: Promise<() => Promise<void>>;

  start(hass: HomeAssistant, instanceId: string, cameras: string[]): void {
    if (this.unsubscribe) return;
    const wanted = new Set(cameras);
    // Subscribe first, so no review that starts during the load is missed.
    this.unsubscribe = subscribeReviews(hass, instanceId, (message) => {
      if (message.after.severity !== "alert" || !wanted.has(message.after.camera)) return;
      this.reviews = upsertReview(this.reviews, message.after, LIMIT);
      this.notify();
    });
    const after = Math.floor(Date.now() / 1000) - HOURS * 3600;
    getReviews(hass, instanceId, cameras, after, LIMIT).then(
      (loaded) => {
        let reviews = this.reviews;
        for (const review of loaded) reviews = upsertReview(reviews, review, LIMIT);
        this.reviews = reviews;
        this.error = undefined;
        this.notify();
      },
      (error) => {
        this.error = (error as { message?: string }).message ?? String(error);
        this.notify();
      },
    );
  }

  stop(): void {
    void this.unsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => undefined);
    this.unsubscribe = undefined;
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
