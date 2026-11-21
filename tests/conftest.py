"""Shared fixtures for Camera Hub tests."""

from __future__ import annotations

from collections.abc import Generator
from unittest.mock import patch

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.camera_hub.const import (
    CONF_CAMERAS,
    CONF_DEFAULT_CAMERA,
    CONF_ZONES,
    DOMAIN,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Let Home Assistant load the integration from custom_components."""


@pytest.fixture
def frigate_cameras(hass: HomeAssistant) -> None:
    """Camera entities as the Frigate integration creates them."""
    MockConfigEntry(domain="frigate").add_to_hass(hass)
    hass.states.async_set(
        "camera.nursery",
        "idle",
        {"camera_name": "nursery", "client_id": "frigate", "friendly_name": "Nursery"},
    )
    hass.states.async_set(
        "camera.porch",
        "idle",
        {"camera_name": "porch", "client_id": "frigate", "friendly_name": "Porch"},
    )
    # The parts of the Frigate config Camera Hub reads: the nursery stream has
    # a two-way audio backchannel and the nursery has ONVIF pan and tilt.
    hass.data["frigate"] = {
        "frigate_entry": {
            "config": {
                "mqtt": {"client_id": "frigate"},
                "go2rtc": {
                    "streams": {
                        "nursery": [
                            "rtsp://user:secret@10.0.0.2:554/ch0",
                            "rtsp://user:secret@10.0.0.2:554/ch0#media=audio#backchannel=1",
                        ],
                        "porch": ["rtsp://user:secret@10.0.0.3:554/main"],
                    }
                },
                "cameras": {"nursery": {"onvif": {"host": "10.0.0.2"}}, "porch": {}},
            }
        }
    }


@pytest.fixture
def no_mqtt_socket_timer() -> Generator[None]:
    """Keep MQTT from starting its socket timer.

    MQTT runs a periodic socket timer that it cancels only when its socket
    closes. The mocked client has no socket, so the timer would still be
    pending when the test ends, and the test harness fails such tests. The
    timer does nothing useful with a mocked client, so it is not started.
    """
    with patch(
        "homeassistant.components.mqtt.client.MQTT._async_start_misc_periodic",
        lambda self: None,
    ):
        yield


@pytest.fixture
def mocked_mqtt(no_mqtt_socket_timer: None, mqtt_mock) -> None:
    """Set up the mocked MQTT integration without its socket timer."""


@pytest.fixture
def hub_entry(hass: HomeAssistant) -> MockConfigEntry:
    """A Camera Hub config entry for the two Frigate cameras."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Camera Hub",
        options={
            CONF_CAMERAS: ["camera.nursery", "camera.porch"],
            CONF_DEFAULT_CAMERA: "camera.nursery",
            CONF_ZONES: [
                {"name": "Backyard", "cameras": ["camera.porch"], "notify": True},
                {"name": "Inside", "cameras": ["camera.nursery"], "notify": False},
            ],
        },
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
async def hub(
    hass: HomeAssistant, mocked_mqtt: None, frigate_cameras: None, hub_entry: MockConfigEntry
) -> MockConfigEntry:
    """Camera Hub, set up."""
    assert await hass.config_entries.async_setup(hub_entry.entry_id)
    await hass.async_block_till_done()
    return hub_entry
