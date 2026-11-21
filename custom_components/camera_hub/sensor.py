"""One sensor per zone: when the zone's pause ends."""

from __future__ import annotations

from datetime import datetime

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .hub import CameraHubConfigEntry, hub_device_info
from .models import Zone


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CameraHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the pause end sensors."""
    async_add_entities(ZonePausedUntilSensor(entry, zone) for zone in entry.runtime_data.zones)


class ZonePausedUntilSensor(SensorEntity):
    """The time the zone's pause ends, or unknown when it is not paused."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:timer-sand"

    def __init__(self, entry: CameraHubConfigEntry, zone: Zone) -> None:
        self._pauses = entry.runtime_data.pauses
        self._zone = zone
        self._attr_unique_id = f"{entry.entry_id}_{zone.id}_paused_until"
        self._attr_name = f"{zone.name} paused until"
        self._attr_device_info = hub_device_info(entry)

    async def async_added_to_hass(self) -> None:
        """Follow the zone's pause."""
        self.async_on_remove(self._pauses.async_add_listener(self.async_write_ha_state))

    @property
    def native_value(self) -> datetime | None:
        """Return the end of the pause."""
        return self._pauses.paused_until(self._zone.id)
