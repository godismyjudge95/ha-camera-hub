"""Tests for the Camera Hub config and options flows."""

from __future__ import annotations

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.camera_hub.const import (
    CONF_CAMERAS,
    CONF_DEFAULT_CAMERA,
    CONF_RETURN_AFTER,
    CONF_ZONES,
    DOMAIN,
)


async def test_aborts_without_frigate(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "frigate_missing"


async def test_default_camera_must_be_selected(hass: HomeAssistant, frigate_cameras: None) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_CAMERAS: ["camera.porch"], CONF_DEFAULT_CAMERA: "camera.nursery"},
    )

    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_DEFAULT_CAMERA: "default_not_selected"}


async def test_creates_entry_with_cameras_as_options(
    hass: HomeAssistant, frigate_cameras: None
) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_CAMERAS: ["camera.nursery", "camera.porch"], CONF_DEFAULT_CAMERA: "camera.nursery"},
    )

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["options"] == {
        CONF_CAMERAS: ["camera.nursery", "camera.porch"],
        CONF_DEFAULT_CAMERA: "camera.nursery",
        CONF_RETURN_AFTER: 120,
    }


async def test_options_flow_changes_cameras(
    hass: HomeAssistant, frigate_cameras: None, hub_entry: MockConfigEntry
) -> None:
    result = await hass.config_entries.options.async_init(hub_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "cameras"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {CONF_CAMERAS: ["camera.porch"], CONF_DEFAULT_CAMERA: "camera.porch", CONF_RETURN_AFTER: 0},
    )

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert hub_entry.options[CONF_CAMERAS] == ["camera.porch"]
    assert hub_entry.options[CONF_DEFAULT_CAMERA] == "camera.porch"
    assert hub_entry.options[CONF_RETURN_AFTER] == 0
    # The zones stay as they were.
    assert len(hub_entry.options[CONF_ZONES]) == 2


async def _zones_form(hass: HomeAssistant, entry: MockConfigEntry) -> str:
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "zones"}
    )
    return result["flow_id"]


async def test_options_flow_saves_zones(
    hass: HomeAssistant, frigate_cameras: None, hub_entry: MockConfigEntry
) -> None:
    flow_id = await _zones_form(hass, hub_entry)
    result = await hass.config_entries.options.async_configure(
        flow_id,
        {CONF_ZONES: [{"name": " Front ", "cameras": ["camera.porch", "camera.nursery"]}]},
    )

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert hub_entry.options[CONF_ZONES] == [
        {
            "name": "Front",
            "cameras": ["camera.porch", "camera.nursery"],
            "priority": [],
            "notify": True,
        }
    ]


@pytest.mark.parametrize(
    ("zones", "error"),
    [
        (
            [
                {"name": "A", "cameras": ["camera.porch"]},
                {"name": "a", "cameras": ["camera.porch"]},
            ],
            "zone_names",
        ),
        ([{"name": "All", "cameras": ["camera.porch"]}], "zone_name_all"),
        ([{"name": "Empty", "cameras": []}], "zone_cameras"),
        (
            [{"name": "Front", "cameras": ["camera.porch"], "priority": ["camera.nursery"]}],
            "zone_priority",
        ),
    ],
)
async def test_options_flow_rejects_unclear_zones(
    hass: HomeAssistant,
    frigate_cameras: None,
    hub_entry: MockConfigEntry,
    zones: list[dict],
    error: str,
) -> None:
    flow_id = await _zones_form(hass, hub_entry)
    result = await hass.config_entries.options.async_configure(flow_id, {CONF_ZONES: zones})

    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_ZONES: error}
