import type { HomeAssistant } from "../ha-types";
import { signPath } from "./ha";

const LIFETIME_SECONDS = 3600;
// Sign again when 80 % of the lifetime is over, so a URL that an <img> or
// <video> starts to load is never about to expire.
const RENEW_AFTER_MS = LIFETIME_SECONDS * 1000 * 0.8;

// Signed media URLs, reused while they are fresh. A list of thumbnails would
// otherwise ask Home Assistant for a new signature on every render.
export class SignedUrls {
  private readonly cache = new Map<string, { url: Promise<string>; signedAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  get(hass: HomeAssistant, path: string): Promise<string> {
    const cached = this.cache.get(path);
    if (cached && this.now() - cached.signedAt < RENEW_AFTER_MS) return cached.url;
    const url = signPath(hass, path, LIFETIME_SECONDS);
    this.cache.set(path, { url, signedAt: this.now() });
    // A failed signature must not stay in the cache.
    url.catch(() => this.cache.delete(path));
    return url;
  }
}

// One cache for the whole card, so a thumbnail signed for the alert list is
// reused as the clip player's poster.
export const signedUrls = new SignedUrls();
