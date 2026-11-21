"""The configuration Camera Hub reads from its config entry options."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from homeassistant.util import slugify

from .const import CONF_ZONES


@dataclass(frozen=True, slots=True)
class Zone:
    """A named group of cameras that share notifications and pauses."""

    id: str
    name: str
    # In priority order: when several cameras of the zone see a person in
    # the same burst, the notification shows the camera highest in this list.
    cameras: tuple[str, ...]
    notify: bool

    def as_dict(self) -> dict[str, Any]:
        """Serialize for the websocket API."""
        return {
            "id": self.id,
            "name": self.name,
            "cameras": list(self.cameras),
            "notify": self.notify,
        }


def zones_from_options(options: Mapping[str, Any]) -> list[Zone]:
    """Read the zones, with a stable id derived from each name."""
    zones: list[Zone] = []
    seen: set[str] = set()
    for raw in options.get(CONF_ZONES, []):
        name = str(raw.get("name", "")).strip()
        zone_id = slugify(name)
        if not zone_id or zone_id in seen:
            continue
        seen.add(zone_id)
        zones.append(
            Zone(
                id=zone_id,
                name=name,
                cameras=tuple(raw.get("cameras", [])),
                notify=bool(raw.get("notify", True)),
            )
        )
    return zones
