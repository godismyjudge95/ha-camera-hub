"""The configuration Camera Hub reads from its config entry options."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from homeassistant.util import slugify

from .const import CONF_DOORBELL, CONF_ZONES, DEFAULT_PERSON_COOLDOWN
from .doorbell import DoorbellConfig


@dataclass(frozen=True, slots=True)
class Zone:
    """A named group of cameras that share notifications and pauses."""

    id: str
    name: str
    cameras: tuple[str, ...]
    # Cameras whose alerts keep the notification over the zone's other
    # cameras, for example a doorbell over a driveway camera.
    priority: tuple[str, ...]
    notify: bool

    def as_dict(self) -> dict[str, Any]:
        """Serialize for the websocket API."""
        return {
            "id": self.id,
            "name": self.name,
            "cameras": list(self.cameras),
            "priority": list(self.priority),
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
                priority=tuple(raw.get("priority", [])),
                notify=bool(raw.get("notify", True)),
            )
        )
    return zones


def doorbell_from_options(options: Mapping[str, Any]) -> DoorbellConfig | None:
    """Read the doorbell, or None when none is set up."""
    raw = options.get(CONF_DOORBELL) or {}
    if not raw.get("camera"):
        return None
    return DoorbellConfig(
        camera=raw["camera"],
        ring_entities=tuple(raw.get("ring", [])),
        person_entities=tuple(raw.get("person", [])),
        person_cooldown=timedelta(
            seconds=raw.get("person_cooldown_seconds", DEFAULT_PERSON_COOLDOWN)
        ),
        tablet_notify=raw.get("tablet_notify") or None,
        tablet_path=raw.get("tablet_path") or None,
    )
