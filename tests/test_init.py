"""Tests for setting up Camera Hub and the API the card reads."""

from __future__ import annotations

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant
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

    assert "/camera_hub_static/camera-hub-card.js?v=0.0.1" in hass.data[DATA_EXTRA_MODULE_URL].urls


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
        "version": "0.0.1",
        "default_camera": "camera.nursery",
        "cameras": [
            {
                "entity_id": "camera.nursery",
                "name": "Nursery",
                "frigate_name": "nursery",
                "instance_id": "frigate",
                "stream": "nursery",
            },
            {
                "entity_id": "camera.porch",
                "name": "Porch",
                "frigate_name": "porch",
                "instance_id": "frigate",
                "stream": "porch",
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
