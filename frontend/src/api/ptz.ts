import type { HomeAssistant } from "../ha-types";

export interface PtzInfo {
  // Frigate's feature names, for example "pt" (pan and tilt) and "zoom".
  features: string[];
  presets: string[];
}

export type PtzMove = "up" | "down" | "left" | "right";

// What the camera's ONVIF PTZ supports, from Frigate.
export async function getPtzInfo(
  hass: HomeAssistant,
  instanceId: string,
  camera: string,
): Promise<PtzInfo> {
  const info = await hass.callWS<string | PtzInfo>({
    type: "frigate/ptz/info",
    instance_id: instanceId,
    camera,
  });
  const parsed = (typeof info === "string" ? JSON.parse(info) : info) as Partial<PtzInfo>;
  return { features: parsed.features ?? [], presets: parsed.presets ?? [] };
}

// Frigate moves the camera until it gets "stop".
export function ptzCommand(
  hass: HomeAssistant,
  entityId: string,
  action: "move" | "zoom" | "preset" | "stop",
  argument = "",
): Promise<unknown> {
  return hass.callService("frigate", "ptz", { action, argument }, { entity_id: entityId });
}
