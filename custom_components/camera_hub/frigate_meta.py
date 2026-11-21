"""Read camera details from the Frigate integration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant

from .const import FRIGATE_DOMAIN


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
    # A smaller go2rtc stream of the same camera (Frigate's detect stream),
    # for devices that cannot decode the main stream. None if there is none.
    fallback_stream: str | None
    # The stream has a go2rtc backchannel, so the card can send microphone
    # audio to the camera's speaker.
    talk: bool
    # Frigate controls the camera's pan and tilt over ONVIF.
    ptz: bool

    def as_dict(self) -> dict[str, Any]:
        """Serialize for the websocket API."""
        return {
            "entity_id": self.entity_id,
            "name": self.name,
            "frigate_name": self.frigate_name,
            "instance_id": self.instance_id,
            "stream": self.stream,
            "fallback_stream": self.fallback_stream,
            "talk": self.talk,
            "ptz": self.ptz,
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
    config = _frigate_config(hass, instance_id)
    return CameraInfo(
        entity_id=entity_id,
        name=state.name,
        frigate_name=frigate_name,
        instance_id=instance_id,
        stream=frigate_name,
        fallback_stream=_fallback_stream(config, frigate_name),
        talk=_has_backchannel(config, frigate_name),
        ptz=_has_onvif(config, frigate_name),
    )


def _frigate_config(hass: HomeAssistant, instance_id: str) -> dict[str, Any]:
    """Return the Frigate config the Frigate integration keeps in memory.

    It is internal to the Frigate integration, so anything unexpected counts
    as no config: the card then offers no talk and no PTZ, and still works.
    """
    for entry_data in hass.data.get(FRIGATE_DOMAIN, {}).values():
        if not isinstance(entry_data, dict):
            continue
        config = entry_data.get("config")
        if not isinstance(config, dict):
            continue
        client_id = (config.get("mqtt") or {}).get("client_id", FRIGATE_DOMAIN)
        if client_id == instance_id:
            return config
    return {}


def frigate_topic_prefix(hass: HomeAssistant) -> str:
    """Return the MQTT topic prefix Frigate publishes under."""
    for entry_data in hass.data.get(FRIGATE_DOMAIN, {}).values():
        if isinstance(entry_data, dict) and isinstance(entry_data.get("config"), dict):
            prefix = (entry_data["config"].get("mqtt") or {}).get("topic_prefix")
            if isinstance(prefix, str) and prefix:
                return prefix
    return FRIGATE_DOMAIN


def _fallback_stream(config: dict[str, Any], camera: str) -> str | None:
    """Return the camera's detect stream, if go2rtc has it.

    Frigate's `live.streams` names it "Detect" in many setups; otherwise the
    restream that the camera's detect input reads is used.
    """
    streams = (config.get("go2rtc") or {}).get("streams") or {}
    camera_config = (config.get("cameras") or {}).get(camera) or {}
    candidates: list[str] = []
    live = (camera_config.get("live") or {}).get("streams") or {}
    if isinstance(live, dict) and isinstance(live.get("Detect"), str):
        candidates.append(live["Detect"])
    for source in (camera_config.get("ffmpeg") or {}).get("inputs") or []:
        if isinstance(source, dict) and "detect" in (source.get("roles") or []):
            path = str(source.get("path", ""))
            if "127.0.0.1:8554/" in path:
                candidates.append(path.split("127.0.0.1:8554/", 1)[1].split("?", 1)[0])
    for candidate in candidates:
        if candidate != camera and candidate in streams:
            return candidate
    return None


def _has_backchannel(config: dict[str, Any], stream: str) -> bool:
    sources = ((config.get("go2rtc") or {}).get("streams") or {}).get(stream) or []
    if isinstance(sources, str):
        sources = [sources]
    return any(isinstance(source, str) and "backchannel=1" in source for source in sources)


def _has_onvif(config: dict[str, Any], camera: str) -> bool:
    onvif = ((config.get("cameras") or {}).get(camera) or {}).get("onvif") or {}
    return bool(onvif.get("host"))
