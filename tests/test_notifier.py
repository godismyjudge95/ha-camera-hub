"""Tests for sending Frigate alerts as phone notifications."""

from __future__ import annotations

import json

from homeassistant.const import STATE_OFF
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_mqtt_message,
    async_mock_service,
)

from custom_components.camera_hub.const import (
    CONF_DELIVERY,
    CONF_FACES,
    CONF_RECIPIENTS,
    DELIVERY_LIVE,
    DELIVERY_SHADOW,
    EVENT_DECISION,
)


def review(kind: str, review_id: str, camera: str = "porch", sub_labels: list | None = None) -> str:
    return json.dumps(
        {
            "type": kind,
            "after": {
                "id": review_id,
                "camera": camera,
                "severity": "alert",
                "data": {
                    "detections": [f"event-{review_id}"],
                    "objects": ["person"],
                    "sub_labels": sub_labels or [],
                },
            },
        }
    )


async def _setup(hass: HomeAssistant, entry: MockConfigEntry, delivery: str) -> None:
    hass.config_entries.async_update_entry(
        entry,
        options={
            **entry.options,
            CONF_DELIVERY: delivery,
            CONF_RECIPIENTS: ["mobile_app_phone"],
            CONF_FACES: [{"sub_label": "Daniel", "person": "person.daniel"}],
        },
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


@pytest.fixture
def phone(hass: HomeAssistant):
    return async_mock_service(hass, "notify", "mobile_app_phone")


async def test_live_delivery_sends_one_updating_notification_per_burst(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry, phone
) -> None:
    await _setup(hass, hub_entry, DELIVERY_LIVE)

    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r1"))
    async_fire_mqtt_message(hass, "frigate/reviews", review("update", "r1"))
    await hass.async_block_till_done()

    assert len(phone) == 2
    first, second = phone[0].data, phone[1].data
    assert first["title"] == "Person · Porch"
    assert first["data"]["tag"] == second["data"]["tag"] == "event-r1"
    assert first["data"]["alert_once"] is True
    assert first["data"]["clickAction"] == "/api/frigate/notifications/event-r1/porch/clip.mp4"
    assert first["data"]["actions"][2]["action"] == "CAMERA_HUB_PAUSE_backyard"


async def test_shadow_delivery_only_reports_decisions(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry, phone
) -> None:
    decisions = async_capture_events(hass, EVENT_DECISION)
    await _setup(hass, hub_entry, DELIVERY_SHADOW)

    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r1"))
    await hass.async_block_till_done()

    assert phone == []
    assert decisions[0].data["decision"] == "notify"
    assert decisions[0].data["zone"] == "backyard"


async def test_no_notification_for_a_face_of_someone_at_home(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry, phone
) -> None:
    hass.states.async_set("person.daniel", "home")
    await _setup(hass, hub_entry, DELIVERY_LIVE)

    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r1", sub_labels=["daniel"]))
    await hass.async_block_till_done()

    assert phone == []


async def test_the_notification_pause_button_pauses_the_zone(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry, phone
) -> None:
    await _setup(hass, hub_entry, DELIVERY_LIVE)

    hass.bus.async_fire("mobile_app_notification_action", {"action": "CAMERA_HUB_PAUSE_backyard"})
    await hass.async_block_till_done()
    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r1"))
    await hass.async_block_till_done()

    assert hass.states.get("switch.camera_hub_backyard_alerts").state == STATE_OFF
    assert phone == []


async def test_a_burst_continues_through_a_reload(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry, phone
) -> None:
    await _setup(hass, hub_entry, DELIVERY_LIVE)
    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r1"))
    await hass.async_block_till_done()

    assert await hass.config_entries.async_reload(hub_entry.entry_id)
    await hass.async_block_till_done()
    async_fire_mqtt_message(hass, "frigate/reviews", review("new", "r2"))
    await hass.async_block_till_done()

    # The second alert updates the first notification instead of starting one.
    assert [call.data["data"]["tag"] for call in phone] == ["event-r1", "event-r1"]
