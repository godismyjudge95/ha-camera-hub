"""One switch per zone: on while the zone's notifications are on."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DEFAULT_PAUSE_MINUTES
from .hub import CameraHubConfigEntry, hub_device_info
from .models import Zone


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CameraHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the zone switches."""
    async_add_entities(ZoneAlertsSwitch(entry, zone) for zone in entry.runtime_data.zones)


class ZoneAlertsSwitch(SwitchEntity):
    """Turning it off pauses the zone's notifications for an hour."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: CameraHubConfigEntry, zone: Zone) -> None:
        self._pauses = entry.runtime_data.pauses
        self._zone = zone
        self._attr_unique_id = f"{entry.entry_id}_{zone.id}_alerts"
        self._attr_name = f"{zone.name} alerts"
        self._attr_device_info = hub_device_info(entry)

    async def async_added_to_hass(self) -> None:
        """Follow the zone's pause."""
        self.async_on_remove(self._pauses.async_add_listener(self.async_write_ha_state))

    @property
    def is_on(self) -> bool:
        """Notifications are on while the zone is not paused."""
        return not self._pauses.is_paused(self._zone.id)

    @property
    def icon(self) -> str:
        """Show a bell that is off while paused."""
        return "mdi:bell-ring-outline" if self.is_on else "mdi:bell-sleep"

    async def async_turn_on(self, **kwargs: Any) -> None:
        """End the pause."""
        self._pauses.async_resume(self._zone.id)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Pause for the default time."""
        self._pauses.async_pause(self._zone.id, timedelta(minutes=DEFAULT_PAUSE_MINUTES))
