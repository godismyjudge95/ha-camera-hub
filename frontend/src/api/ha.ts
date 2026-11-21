import type { HomeAssistant, HubConfig } from "../ha-types";

export function getHubConfig(hass: HomeAssistant): Promise<HubConfig> {
  return hass.callWS<HubConfig>({ type: "camera_hub/config" });
}

// Returns a URL with an `authSig` token, for requests that cannot send an
// Authorization header (websockets, <img>, <video>). Home Assistant checks the
// token when the request starts, so a short lifetime is enough for websockets.
export async function signPath(
  hass: HomeAssistant,
  path: string,
  expiresSeconds = 30,
): Promise<string> {
  const result = await hass.callWS<{ path: string }>({
    type: "auth/sign_path",
    path,
    expires: expiresSeconds,
  });
  return hass.hassUrl(result.path);
}

// The ICE servers Home Assistant gives WebRTC clients. With Home Assistant
// Cloud this includes TURN relays, so WebRTC also works away from home. The
// TURN credentials are temporary: fetch them for every new connection.
export async function getIceServers(
  hass: HomeAssistant,
  cameraEntityId: string,
): Promise<RTCIceServer[]> {
  const result = await hass.callWS<{ configuration?: RTCConfiguration }>({
    type: "camera/webrtc/get_client_config",
    entity_id: cameraEntityId,
  });
  return result.configuration?.iceServers ?? [];
}
