"""Read camera details from the Frigate integration's camera entities."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant


@dataclass(frozen=True, slots=True)
class CameraInfo:
    """What the card needs to know about one Frigate camera."""

    entity_id: str
    name: str
    frigate_name: str
    instance_id: str
    # The go2rtc stream the card plays. Frigate names each camera's restream
    # after the camera and keeps it running, so it starts in about a second.
    # Frigate's extra live streams (for example transcodes) can start only on
    # demand and take much longer.
    stream: str

    def as_dict(self) -> dict[str, str]:
        """Serialize for the websocket API."""
        return {
            "entity_id": self.entity_id,
            "name": self.name,
            "frigate_name": self.frigate_name,
            "instance_id": self.instance_id,
            "stream": self.stream,
        }


def get_camera_info(hass: HomeAssistant, entity_id: str) -> CameraInfo | None:
    """Return camera details, or None if the entity is not a Frigate camera."""
    state = hass.states.get(entity_id)
    if state is None:
        return None
    frigate_name = state.attributes.get("camera_name")
    instance_id = state.attributes.get("client_id")
    if not frigate_name or not instance_id:
        return None
    return CameraInfo(
        entity_id=entity_id,
        name=state.name,
        frigate_name=frigate_name,
        instance_id=instance_id,
        stream=frigate_name,
    )
