// The small part of the Home Assistant frontend API that the card uses.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HassConnection {
  subscribeMessage<T>(
    callback: (message: T) => void,
    message: Record<string, unknown>,
  ): Promise<() => Promise<void>>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  user?: { id: string };
  connection: HassConnection;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ): Promise<unknown>;
  hassUrl(path?: string): string;
}

// The setup the integration returns from `camera_hub/config`.
export interface HubCamera {
  entity_id: string;
  name: string;
  frigate_name: string;
  instance_id: string;
  // The go2rtc stream to play.
  stream: string;
  // A smaller stream of the same camera for devices that cannot decode the
  // main stream, or null.
  fallback_stream: string | null;
  // The stream can send microphone audio to the camera's speaker.
  talk: boolean;
  // Frigate can pan and tilt the camera.
  ptz: boolean;
}

export interface HubZone {
  id: string;
  name: string;
  cameras: string[];
  // The zone sends phone notifications.
  notify: boolean;
  // On while the zone's notifications are on.
  switch_entity: string | null;
  // When the zone's pause ends.
  paused_until_entity: string | null;
}

export interface HubConfig {
  version: string;
  cameras: HubCamera[];
  default_camera: string | null;
  // Seconds without a touch before the main view shows the default camera
  // again. 0 turns this off.
  return_after_seconds: number;
  zones: HubZone[];
  doorbell: HubDoorbell | null;
}

export interface HubDoorbell {
  camera: HubCamera | null;
  // On while the doorbell takeover shows.
  active_entity: string | null;
  // The user the wall tablet's Companion app signs in as, and the page it
  // opens when the takeover starts.
  tablet_user_id: string | null;
  tablet_path: string | null;
}
