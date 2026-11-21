import type { HomeAssistant } from "../ha-types";

// A still image of a camera, from Home Assistant's camera proxy. The URL in
// `entity_picture` carries an access token that Home Assistant rotates, so
// build the URL from the current state every time. `refresh` makes the
// browser load a new image instead of its cached one.
export function snapshotUrl(
  hass: HomeAssistant,
  entityId: string,
  refresh: number,
): string | undefined {
  const picture = hass.states[entityId]?.attributes.entity_picture;
  if (typeof picture !== "string") return undefined;
  const separator = picture.includes("?") ? "&" : "?";
  return hass.hassUrl(`${picture}${separator}t=${refresh}`);
}

export function isCameraOffline(hass: HomeAssistant, entityId: string): boolean {
  const state = hass.states[entityId]?.state;
  return state === undefined || state === "unavailable";
}
