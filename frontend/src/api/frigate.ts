// Calls to the Frigate integration's websocket API.

import type { HomeAssistant } from "../ha-types";
import type { Review, ReviewMessage } from "../reviews";

// The Frigate integration returns its review and event lists as JSON text.
export async function getReviews(
  hass: HomeAssistant,
  instanceId: string,
  cameras: string[],
  afterEpochSeconds: number,
  limit: number,
): Promise<Review[]> {
  const result = await hass.callWS<string>({
    type: "frigate/reviews/get",
    instance_id: instanceId,
    cameras,
    severity: "alert",
    after: afterEpochSeconds,
    limit,
  });
  return JSON.parse(result) as Review[];
}

// Calls `onMessage` for every new, updated and ended review.
export function subscribeReviews(
  hass: HomeAssistant,
  instanceId: string,
  onMessage: (message: ReviewMessage) => void,
): Promise<() => Promise<void>> {
  return hass.connection.subscribeMessage<string>(
    (raw) => onMessage(JSON.parse(raw) as ReviewMessage),
    { type: "frigate/reviews/subscribe", instance_id: instanceId },
  );
}
