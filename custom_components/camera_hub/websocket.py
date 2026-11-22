"""Websocket API that the Camera Hub card reads its setup from."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.loader import async_get_integration
from homeassistant.util import slugify
import voluptuous as vol

from .const import (
    CONF_CAMERAS,
    CONF_DEFAULT_CAMERA,
    CONF_RETURN_AFTER,
    DEFAULT_RETURN_AFTER,
    DOMAIN,
)
from .frigate_meta import get_camera_info
from .hub import CameraHubConfigEntry

# The card's warnings and errors, so a failure on a wall tablet or a phone
# shows in the Home Assistant log.
_CARD_LOGGER = logging.getLogger(f"{__package__}.card")
_LEVELS = {"info": logging.INFO, "warning": logging.WARNING, "error": logging.ERROR}


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_log)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/log",
        vol.Required("level"): vol.In(list(_LEVELS)),
        vol.Required("scope"): vol.All(str, vol.Length(max=40)),
        vol.Required("message"): vol.All(str, vol.Length(max=1000)),
        vol.Optional("details", default=""): vol.All(str, vol.Length(max=2000)),
        vol.Optional("client", default=""): vol.All(str, vol.Length(max=400)),
    }
)
@callback
def ws_log(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Write a message from the card to the Home Assistant log."""
    user = connection.user.name if connection.user else "unknown user"
    _CARD_LOGGER.log(
        _LEVELS[msg["level"]],
        "[%s] %s%s (%s; %s)",
        msg["scope"],
        msg["message"],
        f" | {msg['details']}" if msg["details"] else "",
        user,
        msg["client"] or "unknown client",
    )
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config"})
@websocket_api.async_response
async def ws_get_config(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the cameras and defaults for the card."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "not_configured", "Camera Hub is not set up")
        return

    entry: CameraHubConfigEntry = entries[0]
    options = entry.options
    registry = er.async_get(hass)
    zones = [
        zone.as_dict()
        | {
            "switch_entity": registry.async_get_entity_id(
                "switch", DOMAIN, f"{entry.entry_id}_{zone.id}_alerts"
            ),
            "paused_until_entity": registry.async_get_entity_id(
                "sensor", DOMAIN, f"{entry.entry_id}_{zone.id}_paused_until"
            ),
        }
        for zone in entry.runtime_data.zones
    ]
    cameras = [
        info.as_dict()
        for entity_id in options.get(CONF_CAMERAS, [])
        if (info := get_camera_info(hass, entity_id)) is not None
    ]
    integration = await async_get_integration(hass, DOMAIN)
    connection.send_result(
        msg["id"],
        {
            "version": str(integration.version),
            "cameras": cameras,
            "default_camera": options.get(CONF_DEFAULT_CAMERA),
            "return_after_seconds": options.get(CONF_RETURN_AFTER, DEFAULT_RETURN_AFTER),
            "zones": zones,
            "doorbell": _doorbell(hass, registry, entry),
        },
    )


def _doorbell(
    hass: HomeAssistant, registry: er.EntityRegistry, entry: CameraHubConfigEntry
) -> dict[str, Any] | None:
    doorbell = entry.runtime_data.doorbell
    if doorbell is None:
        return None
    camera = get_camera_info(hass, doorbell.config.camera)
    return {
        "camera": camera.as_dict() if camera else None,
        "active_entity": registry.async_get_entity_id(
            "binary_sensor", DOMAIN, f"{entry.entry_id}_doorbell"
        ),
        "tablet_user_id": _tablet_user_id(hass, doorbell.config.tablet_notify),
        "tablet_path": doorbell.config.tablet_path,
    }


def _tablet_user_id(hass: HomeAssistant, notify_service: str | None) -> str | None:
    """Return the Home Assistant user that the tablet's Companion app signs in as.

    The Companion app's notify service is `mobile_app_<device name>`; its
    mobile_app config entry records the user who registered the app.
    """
    if not notify_service:
        return None
    for entry in hass.config_entries.async_entries("mobile_app"):
        if f"mobile_app_{slugify(entry.data.get('device_name', ''))}" == notify_service:
            return entry.data.get("user_id")
    return None
