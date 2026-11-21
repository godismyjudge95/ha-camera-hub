"""The doorbell sensor: on while a doorbell takeover shows."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .hub import CameraHubConfigEntry, hub_device_info


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CameraHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the doorbell sensor when a doorbell is set up."""
    if entry.runtime_data.doorbell is not None:
        async_add_entities([DoorbellSensor(entry)])


class DoorbellSensor(BinarySensorEntity):
    """The card shows the doorbell while this is on."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_name = "Doorbell"
    _attr_icon = "mdi:doorbell-video"

    def __init__(self, entry: CameraHubConfigEntry) -> None:
        self._doorbell = entry.runtime_data.doorbell
        self._attr_unique_id = f"{entry.entry_id}_doorbell"
        self._attr_device_info = hub_device_info(entry)

    async def async_added_to_hass(self) -> None:
        """Follow the takeovers."""
        self.async_on_remove(self._doorbell.async_add_listener(self._changed))

    @callback
    def _changed(self, _trigger: str | None) -> None:
        self.async_write_ha_state()

    @property
    def is_on(self) -> bool:
        """On while a takeover shows."""
        return self._doorbell.takeover is not None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """What started the takeover, when, and which camera to show."""
        takeover = self._doorbell.takeover
        return {
            "camera": self._doorbell.config.camera,
            "trigger": takeover.trigger if takeover else None,
            "started_at": takeover.started_at.isoformat() if takeover else None,
        }
