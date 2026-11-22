// Opens the Camera Hub dashboard on the wall tablet when the doorbell
// takeover starts.
//
// The card bundle loads on every Home Assistant page, so this runs while the
// tablet shows any dashboard. It changes the page inside the running app, as
// Home Assistant's own links do, so nothing loads again. The Companion app's
// `command_webview` would load the whole app again, which takes about 10
// seconds on a slow tablet.

import { getHubConfig } from "./api/ha";
import { errorMessage } from "./errors";
import type { HomeAssistant } from "./ha-types";
import { logger } from "./log";

const log = logger("doorbell");

const HASS_POLL_MS = 1000;

// A `subscribe_entities` message: "a" adds entities with their whole state
// (also after a reconnect), "c" gives the changes of an entity.
export interface EntitiesMessage {
  a?: Record<string, { s?: string }>;
  c?: Record<string, { "+"?: { s?: string } }>;
}

// The state of the entity that the message gives, if it gives one.
export function stateInMessage(message: EntitiesMessage, entityId: string): string | undefined {
  return message.a?.[entityId]?.s ?? message.c?.[entityId]?.["+"]?.s;
}

export function startDoorbellNavigator(): void {
  void run().catch((error) => log.warn(`The doorbell cannot open the tablet's dashboard: ${errorMessage(error)}`));
}

async function run(): Promise<void> {
  const hass = await waitForHass();
  const doorbell = (await getHubConfig(hass)).doorbell;
  const entityId = doorbell?.active_entity;
  const path = doorbell?.tablet_path;
  if (!entityId || !path || !doorbell.tablet_user_id || doorbell.tablet_user_id !== hass.user?.id) return;

  await hass.connection.subscribeMessage<EntitiesMessage>(
    (message) => {
      // The first message, and the one after a reconnect (the screen was
      // off), also counts: the takeover can already be showing.
      if (stateInMessage(message, entityId) === "on" && location.pathname !== path) {
        log.info(`The doorbell takeover started: opening ${path}`);
        navigate(path);
      }
    },
    { type: "subscribe_entities", entity_ids: [entityId] },
  );
}

// Home Assistant's own way to change the page without a reload.
function navigate(path: string): void {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}

function waitForHass(): Promise<HomeAssistant> {
  return new Promise((resolve) => {
    const check = () => {
      const hass = (document.querySelector("home-assistant") as { hass?: HomeAssistant } | null)?.hass;
      if (hass?.user && hass.connection) resolve(hass);
      else setTimeout(check, HASS_POLL_MS);
    };
    check();
  });
}
