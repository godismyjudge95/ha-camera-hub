"""Tests for setting up Camera Hub and the API the card reads."""

from __future__ import annotations

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.camera_hub.const import CONF_CAMERAS


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_card_bundle_is_loaded_on_dashboards(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry
) -> None:
    await _setup(hass, hub_entry)

    assert "/camera_hub_static/camera-hub-card.js?v=0.8.1" in hass.data[DATA_EXTRA_MODULE_URL].urls


async def test_config_lists_cameras_with_their_streams(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    mocked_mqtt: None,
    frigate_cameras: None,
    hub_entry: MockConfigEntry,
) -> None:
    await _setup(hass, hub_entry)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "camera_hub/config"})
    response = await client.receive_json()

    assert response["success"]
    assert response["result"] == {
        "version": "0.8.1",
        "default_camera": "camera.nursery",
        # Entries made before this option existed get the default.
        "return_after_seconds": 120,
        "doorbell": None,
        "zones": [
            {
                "id": "backyard",
                "name": "Backyard",
                "cameras": ["camera.porch"],
                "priority": [],
                "notify": True,
                "switch_entity": "switch.camera_hub_backyard_alerts",
                "paused_until_entity": "sensor.camera_hub_backyard_paused_until",
            },
            {
                "id": "inside",
                "name": "Inside",
                "cameras": ["camera.nursery"],
                "priority": [],
                "notify": False,
                "switch_entity": "switch.camera_hub_inside_alerts",
                "paused_until_entity": "sensor.camera_hub_inside_paused_until",
            },
        ],
        "cameras": [
            {
                "entity_id": "camera.nursery",
                "name": "Nursery",
                "frigate_name": "nursery",
                "instance_id": "frigate",
                "stream": "nursery",
                "fallback_stream": "nursery_sub",
                "talk": True,
                "ptz": True,
            },
            {
                "entity_id": "camera.porch",
                "name": "Porch",
                "frigate_name": "porch",
                "instance_id": "frigate",
                "stream": "porch",
                "fallback_stream": "porch_sub",
                "talk": False,
                "ptz": False,
            },
        ],
    }


async def test_config_skips_entities_that_are_not_frigate_cameras(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    mocked_mqtt: None,
    frigate_cameras: None,
    hub_entry: MockConfigEntry,
) -> None:
    hass.states.async_set("camera.other", "idle", {"friendly_name": "Other"})
    hass.config_entries.async_update_entry(
        hub_entry, options={**hub_entry.options, CONF_CAMERAS: ["camera.other", "camera.porch"]}
    )
    await _setup(hass, hub_entry)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "camera_hub/config"})
    response = await client.receive_json()

    assert [camera["entity_id"] for camera in response["result"]["cameras"]] == ["camera.porch"]


async def test_card_messages_go_to_the_home_assistant_log(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    mocked_mqtt: None,
    frigate_cameras: None,
    hub_entry: MockConfigEntry,
    caplog: pytest.LogCaptureFixture,
) -> None:
    await _setup(hass, hub_entry)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "camera_hub/log",
            "level": "error",
            "scope": "recording",
            "message": "A recording did not play: This device cannot decode this video",
            "details": "media_error_code=3",
            "client": "Tablet browser",
        }
    )
    response = await client.receive_json()

    assert response["success"]
    record = next(r for r in caplog.records if r.name == "custom_components.camera_hub.card")
    assert record.levelname == "ERROR"
    assert record.getMessage().startswith(
        "[recording] A recording did not play: This device cannot decode this video"
        " | media_error_code=3 ("
    )
    assert record.getMessage().endswith("; Tablet browser)")
