"""Websocket API that the Camera Hub card reads its setup from."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration
import voluptuous as vol

from .const import CONF_CAMERAS, CONF_DEFAULT_CAMERA, DOMAIN
from .frigate_meta import get_camera_info


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_get_config)


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

    options = entries[0].options
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
        },
    )
