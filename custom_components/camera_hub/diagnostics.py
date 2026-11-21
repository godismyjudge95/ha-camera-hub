"""Diagnostics for Camera Hub."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import CONF_FACES, CONF_RECIPIENTS
from .hub import CameraHubConfigEntry

TO_REDACT = {CONF_RECIPIENTS, CONF_FACES}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: CameraHubConfigEntry
) -> dict[str, Any]:
    """Return the options, the pauses and the last notification decisions."""
    data = entry.runtime_data
    return {
        "options": async_redact_data(dict(entry.options), TO_REDACT),
        "paused_until": {
            zone.id: until.isoformat()
            for zone in data.zones
            if (until := data.pauses.paused_until(zone.id))
        },
        "decisions": list(data.notifier.history),
    }
