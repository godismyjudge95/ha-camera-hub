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
}

export interface HubConfig {
  version: string;
  cameras: HubCamera[];
  default_camera: string | null;
  // Seconds without a touch before the main view shows the default camera
  // again. 0 turns this off.
  return_after_seconds: number;
}
