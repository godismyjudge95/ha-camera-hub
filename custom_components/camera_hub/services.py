"""Services to pause and resume zone notifications, and to end a doorbell takeover."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import ALL_ZONES, DEFAULT_PAUSE_MINUTES, DOMAIN
from .doorbell import TRIGGER_RING
from .hub import CameraHubConfigEntry

SERVICE_PAUSE_ZONE = "pause_zone"
SERVICE_RESUME_ZONE = "resume_zone"
SERVICE_DISMISS_DOORBELL = "dismiss_doorbell"
SERVICE_TEST_DOORBELL = "test_doorbell"

ZONE_SCHEMA = vol.Schema({vol.Required("zone"): cv.string})
PAUSE_SCHEMA = ZONE_SCHEMA.extend(
    {
        vol.Optional("minutes", default=DEFAULT_PAUSE_MINUTES): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=24 * 60)
        )
    }
)


@callback
def async_register_services(hass: HomeAssistant) -> None:
    """Register the services once for the integration."""

    def entry() -> CameraHubConfigEntry:
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            raise ServiceValidationError("Camera Hub is not set up")
        return entries[0]

    def zone_ids(name: str) -> list[str]:
        zones = entry().runtime_data.zones
        if name.strip().lower() == ALL_ZONES:
            return [zone.id for zone in zones]
        for zone in zones:
            if name in (zone.id, zone.name) or name.lower() == zone.name.lower():
                return [zone.id]
        raise ServiceValidationError(f"Camera Hub has no zone named {name!r}")

    async def pause_zone(call: ServiceCall) -> None:
        pauses = entry().runtime_data.pauses
        for zone_id in zone_ids(call.data["zone"]):
            pauses.async_pause(zone_id, timedelta(minutes=call.data["minutes"]))

    async def resume_zone(call: ServiceCall) -> None:
        pauses = entry().runtime_data.pauses
        for zone_id in zone_ids(call.data["zone"]):
            pauses.async_resume(zone_id)

    async def dismiss_doorbell(call: ServiceCall) -> None:
        if doorbell := entry().runtime_data.doorbell:
            doorbell.async_dismiss()

    async def test_doorbell(call: ServiceCall) -> None:
        doorbell = entry().runtime_data.doorbell
        if doorbell is None:
            raise ServiceValidationError("Camera Hub has no doorbell set up")
        doorbell.async_trigger(TRIGGER_RING)

    hass.services.async_register(DOMAIN, SERVICE_PAUSE_ZONE, pause_zone, schema=PAUSE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_DISMISS_DOORBELL, dismiss_doorbell)
    hass.services.async_register(DOMAIN, SERVICE_TEST_DOORBELL, test_doorbell)
    hass.services.async_register(DOMAIN, SERVICE_RESUME_ZONE, resume_zone, schema=ZONE_SCHEMA)
