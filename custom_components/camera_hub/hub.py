"""The state Camera Hub keeps for its config entry."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo

from .const import DOMAIN
from .models import Zone
from .pause import PauseManager


@dataclass(slots=True)
class HubData:
    """What the platforms, services and websocket API share."""

    zones: list[Zone]
    pauses: PauseManager


type CameraHubConfigEntry = ConfigEntry[HubData]


def hub_device_info(entry: ConfigEntry) -> DeviceInfo:
    """The one device that holds Camera Hub's entities."""
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Camera Hub",
        manufacturer="Camera Hub",
        entry_type=DeviceEntryType.SERVICE,
    )
