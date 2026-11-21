// Calls to the Frigate integration's websocket API.

import type { HomeAssistant } from "../ha-types";
import type { Review, ReviewMessage } from "../reviews";
import type { FrigateRecordingDay } from "../timeline-math";

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

// The days and hours that have recordings of a camera.
export async function getRecordingsSummary(
  hass: HomeAssistant,
  instanceId: string,
  camera: string,
): Promise<FrigateRecordingDay[]> {
  const result = await hass.callWS<string | FrigateRecordingDay[]>({
    type: "frigate/recordings/summary",
    instance_id: instanceId,
    camera,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return typeof result === "string" ? (JSON.parse(result) as FrigateRecordingDay[]) : result;
}

// All reviews (alerts and detections) of one camera between two times.
export async function getCameraReviews(
  hass: HomeAssistant,
  instanceId: string,
  camera: string,
  after: number,
  before: number,
): Promise<Review[]> {
  const result = await hass.callWS<string>({
    type: "frigate/reviews/get",
    instance_id: instanceId,
    cameras: [camera],
    after,
    before,
    limit: 1000,
  });
  return JSON.parse(result) as Review[];
}
