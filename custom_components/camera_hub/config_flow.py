"""Config flow for Camera Hub."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import selector
import voluptuous as vol

from .const import CONF_CAMERAS, CONF_DEFAULT_CAMERA, DOMAIN, FRIGATE_DOMAIN


def _cameras_schema(defaults: dict[str, Any]) -> vol.Schema:
    frigate_camera = selector.EntityFilterSelectorConfig(
        domain="camera", integration=FRIGATE_DOMAIN
    )
    return vol.Schema(
        {
            vol.Required(
                CONF_CAMERAS, default=defaults.get(CONF_CAMERAS, [])
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(filter=frigate_camera, multiple=True)
            ),
            vol.Required(
                CONF_DEFAULT_CAMERA, default=defaults.get(CONF_DEFAULT_CAMERA, vol.UNDEFINED)
            ): selector.EntitySelector(selector.EntitySelectorConfig(filter=frigate_camera)),
        }
    )


def _validate_cameras(user_input: dict[str, Any]) -> dict[str, str]:
    if user_input[CONF_DEFAULT_CAMERA] not in user_input[CONF_CAMERAS]:
        return {CONF_DEFAULT_CAMERA: "default_not_selected"}
    return {}


class CameraHubConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up Camera Hub."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Pick the Frigate cameras the hub shows."""
        if not self.hass.config_entries.async_entries(FRIGATE_DOMAIN):
            return self.async_abort(reason="frigate_missing")

        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate_cameras(user_input)
            if not errors:
                return self.async_create_entry(title="Camera Hub", data={}, options=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=_cameras_schema(user_input or {}),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> CameraHubOptionsFlow:
        """Return the options flow."""
        return CameraHubOptionsFlow()


class CameraHubOptionsFlow(OptionsFlow):
    """Change which cameras the hub shows."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Edit the camera list."""
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate_cameras(user_input)
            if not errors:
                return self.async_create_entry(data={**self.config_entry.options, **user_input})

        return self.async_show_form(
            step_id="init",
            data_schema=_cameras_schema(user_input or dict(self.config_entry.options)),
            errors=errors,
        )
