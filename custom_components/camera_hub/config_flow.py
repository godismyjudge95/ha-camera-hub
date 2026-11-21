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

from .const import (
    ALL_ZONES,
    CONF_CAMERAS,
    CONF_DEFAULT_CAMERA,
    CONF_RETURN_AFTER,
    CONF_ZONES,
    DEFAULT_RETURN_AFTER,
    DOMAIN,
    FRIGATE_DOMAIN,
)
from .models import zones_from_options


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
            vol.Required(
                CONF_RETURN_AFTER, default=defaults.get(CONF_RETURN_AFTER, DEFAULT_RETURN_AFTER)
            ): vol.All(
                selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=0,
                        max=3600,
                        step=10,
                        unit_of_measurement="s",
                        mode=selector.NumberSelectorMode.BOX,
                    )
                ),
                vol.Coerce(int),
            ),
        }
    )


def _zones_schema(zones: list[dict[str, Any]]) -> vol.Schema:
    frigate_camera = selector.EntityFilterSelectorConfig(
        domain="camera", integration=FRIGATE_DOMAIN
    )
    return vol.Schema(
        {
            vol.Optional(CONF_ZONES, default=zones): selector.ObjectSelector(
                selector.ObjectSelectorConfig(
                    multiple=True,
                    label_field="name",
                    fields={
                        "name": {
                            "label": "Name",
                            "required": True,
                            "selector": {"text": {}},
                        },
                        "cameras": {
                            "label": "Cameras, most important first",
                            "required": True,
                            "selector": {
                                "entity": {"filter": [dict(frigate_camera)], "multiple": True}
                            },
                        },
                        "notify": {
                            "label": "Send notifications",
                            "default": True,
                            "selector": {"boolean": {}},
                        },
                    },
                )
            ),
        }
    )


def _validate_zones(zones: list[dict[str, Any]]) -> dict[str, str]:
    names = [str(zone.get("name", "")).strip().lower() for zone in zones]
    if any(not name for name in names) or len(set(names)) != len(names):
        return {CONF_ZONES: "zone_names"}
    if ALL_ZONES in names:
        return {CONF_ZONES: "zone_name_all"}
    if any(not zone.get("cameras") for zone in zones):
        return {CONF_ZONES: "zone_cameras"}
    return {}


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
    """Change the cameras and the zones."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Pick what to change."""
        return self.async_show_menu(step_id="init", menu_options=["cameras", "zones"])

    async def async_step_cameras(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Edit the camera list."""
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate_cameras(user_input)
            if not errors:
                return self.async_create_entry(data={**self.config_entry.options, **user_input})

        return self.async_show_form(
            step_id="cameras",
            data_schema=_cameras_schema(user_input or dict(self.config_entry.options)),
            errors=errors,
        )

    async def async_step_zones(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Edit the zones that group cameras for notifications and pauses."""
        errors: dict[str, str] = {}
        if user_input is not None:
            zones = [
                {
                    "name": str(zone["name"]).strip(),
                    "cameras": list(zone["cameras"]),
                    "notify": bool(zone.get("notify", True)),
                }
                for zone in user_input.get(CONF_ZONES, [])
            ]
            errors = _validate_zones(zones)
            if not errors:
                return self.async_create_entry(
                    data={**self.config_entry.options, CONF_ZONES: zones}
                )
            current = zones
        else:
            current = [
                {"name": zone.name, "cameras": list(zone.cameras), "notify": zone.notify}
                for zone in zones_from_options(self.config_entry.options)
            ]

        return self.async_show_form(
            step_id="zones",
            data_schema=_zones_schema(current),
            errors=errors,
        )
