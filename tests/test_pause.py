"""Tests for pausing zone notifications."""

from __future__ import annotations

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

SWITCH = "switch.camera_hub_backyard_alerts"
UNTIL = "sensor.camera_hub_backyard_paused_until"


def _time_left(hass: HomeAssistant) -> timedelta:
    return dt_util.parse_datetime(hass.states.get(UNTIL).state) - dt_util.utcnow()


async def test_pause_service_pauses_and_ends_on_time(
    hass: HomeAssistant, hub: MockConfigEntry, freezer: FrozenDateTimeFactory
) -> None:
    assert hass.states.get(SWITCH).state == STATE_ON

    await hass.services.async_call(
        "camera_hub", "pause_zone", {"zone": "Backyard", "minutes": 15}, blocking=True
    )

    assert hass.states.get(SWITCH).state == STATE_OFF
    assert abs(_time_left(hass) - timedelta(minutes=15)) < timedelta(seconds=1)

    freezer.tick(timedelta(minutes=15, seconds=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert hass.states.get(SWITCH).state == STATE_ON
    assert hass.states.get(UNTIL).state == STATE_UNKNOWN


async def test_resume_service_ends_the_pause(hass: HomeAssistant, hub: MockConfigEntry) -> None:
    await hass.services.async_call("camera_hub", "pause_zone", {"zone": "backyard"}, blocking=True)
    await hass.services.async_call("camera_hub", "resume_zone", {"zone": "Backyard"}, blocking=True)

    assert hass.states.get(SWITCH).state == STATE_ON


async def test_all_pauses_every_zone(hass: HomeAssistant, hub: MockConfigEntry) -> None:
    await hass.services.async_call("camera_hub", "pause_zone", {"zone": "all"}, blocking=True)

    assert hass.states.get(SWITCH).state == STATE_OFF
    assert hass.states.get("switch.camera_hub_inside_alerts").state == STATE_OFF


async def test_unknown_zone_is_an_error(hass: HomeAssistant, hub: MockConfigEntry) -> None:
    with pytest.raises(ServiceValidationError, match="no zone named 'Garage'"):
        await hass.services.async_call(
            "camera_hub", "pause_zone", {"zone": "Garage"}, blocking=True
        )


async def test_switch_off_pauses_for_an_hour(hass: HomeAssistant, hub: MockConfigEntry) -> None:
    await hass.services.async_call("switch", "turn_off", {"entity_id": SWITCH}, blocking=True)

    assert abs(_time_left(hass) - timedelta(hours=1)) < timedelta(seconds=1)


async def test_pause_survives_a_reload(hass: HomeAssistant, hub: MockConfigEntry) -> None:
    await hass.services.async_call(
        "camera_hub", "pause_zone", {"zone": "Backyard", "minutes": 30}, blocking=True
    )
    # Let the delayed save run.
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=2))
    await hass.async_block_till_done()

    assert await hass.config_entries.async_reload(hub.entry_id)
    await hass.async_block_till_done()

    assert hass.states.get(SWITCH).state == STATE_OFF
