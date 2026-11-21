"""Camera Hub: one camera UI and notification system for Frigate."""

from __future__ import annotations

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import websocket
from .const import DOMAIN
from .doorbell import DoorbellCoordinator
from .frontend import async_register_frontend
from .hub import CameraHubConfigEntry, HubData
from .models import doorbell_from_options, zones_from_options
from .notifier import Notifier
from .pause import PauseManager
from .services import async_register_services

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.EVENT, Platform.SENSOR, Platform.SWITCH]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the parts that do not depend on a config entry."""
    await async_register_frontend(hass)
    websocket.async_register(hass)
    async_register_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: CameraHubConfigEntry) -> bool:
    """Set up Camera Hub from a config entry."""
    zones = zones_from_options(entry.options)
    pauses = PauseManager(hass)
    await pauses.async_load()
    notifier = Notifier(hass, entry.options, zones, pauses)
    doorbell_config = doorbell_from_options(entry.options)
    doorbell = None
    if doorbell_config:
        doorbell_zone = next(
            (zone.id for zone in zones if doorbell_config.camera in zone.cameras), None
        )
        doorbell = DoorbellCoordinator(
            hass,
            doorbell_config,
            lambda: doorbell_zone is not None and pauses.is_paused(doorbell_zone),
        )
    entry.runtime_data = HubData(zones=zones, pauses=pauses, notifier=notifier, doorbell=doorbell)
    entry.async_on_unload(pauses.async_unload)
    entry.async_on_unload(notifier.async_stop)
    await notifier.async_start()
    if doorbell:
        doorbell.async_start()
        entry.async_on_unload(doorbell.async_stop)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: CameraHubConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_options_updated(hass: HomeAssistant, entry: CameraHubConfigEntry) -> None:
    """Zones can change with the options, and with them the entities."""
    await hass.config_entries.async_reload(entry.entry_id)
