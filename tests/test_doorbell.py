"""Tests for the doorbell takeover."""

from __future__ import annotations

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.camera_hub.const import CONF_DOORBELL

ACTIVE = "binary_sensor.camera_hub_doorbell"
EVENT = "event.camera_hub_doorbell"
RING = "binary_sensor.door_visitor"
PERSON = "binary_sensor.door_person"


@pytest.fixture
async def doorbell(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry
):
    """Camera Hub with a doorbell and a wall tablet; returns the tablet's notify calls."""
    hass.states.async_set(RING, STATE_OFF)
    hass.states.async_set(PERSON, STATE_OFF)
    tablet = async_mock_service(hass, "notify", "mobile_app_tablet")
    hass.config_entries.async_update_entry(
        hub_entry,
        options={
            **hub_entry.options,
            CONF_DOORBELL: {
                "camera": "camera.porch",
                "ring": [RING],
                "person": [PERSON],
                "person_cooldown_seconds": 120,
                "tablet_notify": "mobile_app_tablet",
                "tablet_path": "/lovelace/cameras",
            },
        },
    )
    assert await hass.config_entries.async_setup(hub_entry.entry_id)
    await hass.async_block_till_done()
    return tablet


async def _turn_on(hass: HomeAssistant, entity_id: str) -> None:
    hass.states.async_set(entity_id, STATE_ON)
    await hass.async_block_till_done()
    hass.states.async_set(entity_id, STATE_OFF)
    await hass.async_block_till_done()


async def test_ring_shows_the_doorbell_and_wakes_the_tablet(hass: HomeAssistant, doorbell) -> None:
    await _turn_on(hass, RING)

    state = hass.states.get(ACTIVE)
    assert state.state == STATE_ON
    assert state.attributes["trigger"] == "ring"
    assert state.attributes["camera"] == "camera.porch"
    assert hass.states.get(EVENT).attributes["event_type"] == "ring"
    assert [call.data for call in doorbell] == [
        {"message": "command_screen_on"},
        {"message": "command_webview", "data": {"command": "/lovelace/cameras"}},
    ]


async def test_a_person_does_not_restart_a_showing_doorbell(hass: HomeAssistant, doorbell) -> None:
    await _turn_on(hass, RING)
    await _turn_on(hass, PERSON)

    assert hass.states.get(ACTIVE).attributes["trigger"] == "ring"


async def test_a_person_shows_the_doorbell_again_only_after_the_cooldown(
    hass: HomeAssistant, doorbell, freezer: FrozenDateTimeFactory
) -> None:
    await _turn_on(hass, PERSON)
    await hass.services.async_call("camera_hub", "dismiss_doorbell", blocking=True)

    await _turn_on(hass, PERSON)
    assert hass.states.get(ACTIVE).state == STATE_OFF

    freezer.tick(timedelta(seconds=121))
    await _turn_on(hass, PERSON)
    assert hass.states.get(ACTIVE).state == STATE_ON


async def test_dismiss_ends_the_takeover(hass: HomeAssistant, doorbell) -> None:
    await _turn_on(hass, RING)

    await hass.services.async_call("camera_hub", "dismiss_doorbell", blocking=True)

    assert hass.states.get(ACTIVE).state == STATE_OFF


async def test_a_forgotten_takeover_ends_after_five_minutes(
    hass: HomeAssistant, doorbell, freezer: FrozenDateTimeFactory
) -> None:
    await _turn_on(hass, RING)

    freezer.tick(timedelta(minutes=5, seconds=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert hass.states.get(ACTIVE).state == STATE_OFF


async def test_the_card_gets_the_doorbell_camera_and_sensor(
    hass: HomeAssistant, doorbell, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "camera_hub/config"})
    doorbell_config = (await client.receive_json())["result"]["doorbell"]

    assert doorbell_config["camera"]["entity_id"] == "camera.porch"
    assert doorbell_config["active_entity"] == ACTIVE
