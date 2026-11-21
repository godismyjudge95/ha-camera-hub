"""The doorbell event entity, for automations: "ring" or "person"."""

from __future__ import annotations

from homeassistant.components.event import EventDeviceClass, EventEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .doorbell import TRIGGER_PERSON, TRIGGER_RING
from .hub import CameraHubConfigEntry, hub_device_info


async def async_setup_entry(
    hass: HomeAssistant,
    entry: CameraHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the doorbell event when a doorbell is set up."""
    if entry.runtime_data.doorbell is not None:
        async_add_entities([DoorbellEvent(entry)])


class DoorbellEvent(EventEntity):
    """Fires when a doorbell takeover starts."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_name = "Doorbell"
    _attr_device_class = EventDeviceClass.DOORBELL

    def __init__(self, entry: CameraHubConfigEntry) -> None:
        self._attr_event_types = [TRIGGER_RING, TRIGGER_PERSON]
        self._doorbell = entry.runtime_data.doorbell
        self._attr_unique_id = f"{entry.entry_id}_doorbell_event"
        self._attr_device_info = hub_device_info(entry)

    async def async_added_to_hass(self) -> None:
        """Follow the takeovers."""
        self.async_on_remove(self._doorbell.async_add_listener(self._changed))

    @callback
    def _changed(self, trigger: str | None) -> None:
        if trigger is not None:
            self._trigger_event(trigger)
            self.async_write_ha_state()
