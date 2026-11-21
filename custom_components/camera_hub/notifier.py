"""Turns Frigate's review messages into phone notifications.

It listens to Frigate's `reviews` MQTT topic, asks the engine what to do,
and sends the notifications to the configured notify services. In shadow
delivery it sends nothing and only reports each decision as an event, so it
can run next to another notification setup for comparison.
"""

from __future__ import annotations

from collections import deque
from collections.abc import Mapping
from datetime import timedelta
import json
import logging
from typing import Any

from homeassistant.components import mqtt
from homeassistant.const import STATE_HOME
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import (
    CONF_DELIVERY,
    CONF_FACES,
    CONF_QUIET_WINDOW,
    CONF_RECIPIENTS,
    DEFAULT_PAUSE_MINUTES,
    DEFAULT_QUIET_WINDOW,
    DELIVERY_LIVE,
    DELIVERY_OFF,
    EVENT_DECISION,
    PAUSE_ACTION_PREFIX,
)
from .engine import (
    Context,
    EngineConfig,
    EngineState,
    Notify,
    ReviewMessage,
    Skip,
    ZoneRule,
    decide,
)
from .frigate_meta import frigate_topic_prefix, get_camera_info
from .models import Zone
from .pause import PauseManager

_LOGGER = logging.getLogger(__name__)

# Decisions kept for diagnostics.
HISTORY = 50

# Where the bursts wait while the integration reloads, for example after an
# options change. Without it, the alerts of a burst that runs through a
# reload would start a second notification.
_SAVED_STATE = "camera_hub_engine_state"


class Notifier:
    """Sends Frigate alerts as phone notifications."""

    def __init__(
        self,
        hass: HomeAssistant,
        options: Mapping[str, Any],
        zones: list[Zone],
        pauses: PauseManager,
    ) -> None:
        self._hass = hass
        self._zones = zones
        self._pauses = pauses
        self._delivery = options.get(CONF_DELIVERY, DELIVERY_OFF)
        self._recipients: list[str] = list(options.get(CONF_RECIPIENTS, []))
        self._quiet_window = timedelta(seconds=options.get(CONF_QUIET_WINDOW, DEFAULT_QUIET_WINDOW))
        self._faces: dict[str, str] = {
            str(face["sub_label"]).strip().lower(): face["person"]
            for face in options.get(CONF_FACES, [])
            if face.get("sub_label") and face.get("person")
        }
        self._state: EngineState = hass.data.pop(_SAVED_STATE, {})
        self._unsubscribe: list[CALLBACK_TYPE] = []
        self.history: deque[dict[str, Any]] = deque(maxlen=HISTORY)

    async def async_start(self) -> None:
        """Listen for reviews and for the pause button of notifications."""
        if self._delivery == DELIVERY_OFF:
            return
        topic = f"{frigate_topic_prefix(self._hass)}/reviews"
        self._unsubscribe.append(await mqtt.async_subscribe(self._hass, topic, self._on_review))
        self._unsubscribe.append(
            self._hass.bus.async_listen("mobile_app_notification_action", self._on_action)
        )

    @callback
    def async_stop(self) -> None:
        """Stop listening, and keep the bursts for the next start."""
        while self._unsubscribe:
            self._unsubscribe.pop()()
        self._hass.data[_SAVED_STATE] = self._state

    def _engine_config(self) -> tuple[EngineConfig, dict[str, str]]:
        """Build the engine's zones, by Frigate camera name, and the camera names."""
        names: dict[str, str] = {}
        rules = []
        for zone in self._zones:
            frigate_names: dict[str, str] = {}
            for entity_id in zone.cameras:
                if info := get_camera_info(self._hass, entity_id):
                    frigate_names[entity_id] = info.frigate_name
                    names[info.frigate_name] = info.name
            rules.append(
                ZoneRule(
                    id=zone.id,
                    cameras=frozenset(frigate_names.values()),
                    priority=frozenset(
                        frigate_names[entity_id]
                        for entity_id in zone.priority
                        if entity_id in frigate_names
                    ),
                    notify=zone.notify,
                )
            )
        return EngineConfig(zones=tuple(rules), quiet_window=self._quiet_window), names

    def _context(self) -> Context:
        faces_at_home = frozenset(
            label
            for label, person in self._faces.items()
            if (state := self._hass.states.get(person)) is not None and state.state == STATE_HOME
        )
        paused = frozenset(zone.id for zone in self._zones if self._pauses.is_paused(zone.id))
        return Context(now=dt_util.utcnow(), paused=paused, faces_at_home=faces_at_home)

    @callback
    def _on_review(self, msg: mqtt.ReceiveMessage) -> None:
        try:
            payload = json.loads(msg.payload)
        except ValueError:
            return
        review = ReviewMessage.parse(payload) if isinstance(payload, dict) else None
        if review is None:
            return
        config, names = self._engine_config()
        self._state, decision = decide(review, config, self._state, self._context())
        self._report(review, decision)
        if isinstance(decision, Notify) and self._delivery == DELIVERY_LIVE:
            camera_name = names.get(decision.camera, decision.camera)
            self._hass.async_create_task(self._async_send(decision, camera_name))

    def _report(self, review: ReviewMessage, decision: Notify | Skip) -> None:
        record = {
            "time": dt_util.utcnow().isoformat(),
            "review_id": review.review_id,
            "review_type": review.type,
            "camera": review.camera,
            "delivery": self._delivery,
        }
        if isinstance(decision, Notify):
            record |= {
                "decision": "notify",
                "zone": decision.zone_id,
                "winner": decision.camera,
                "tag": decision.tag,
                "new_burst": decision.new_burst,
            }
        else:
            record |= {"decision": "skip", "zone": decision.zone_id, "reason": decision.reason}
        self.history.append(record)
        self._hass.bus.async_fire(EVENT_DECISION, record)

    async def _async_send(self, decision: Notify, camera_name: str) -> None:
        event = decision.event_id
        clip = f"/api/frigate/notifications/{event}/{decision.camera}/clip.mp4"
        data = {
            "title": f"Person · {camera_name}",
            "message": f"A person was seen by the {camera_name} camera.",
            "data": {
                "tag": decision.tag,
                "group": "camera-hub",
                "alert_once": True,
                # A changing query makes the app load the newest image.
                "image": f"/api/frigate/notifications/{event}/thumbnail.jpg"
                f"?t={int(dt_util.utcnow().timestamp())}",
                "clickAction": clip,
                "url": clip,
                "ttl": 0,
                "priority": "high",
                "notification_icon": "mdi:account-outline",
                "actions": [
                    {"action": "URI", "title": "View clip", "uri": clip},
                    {
                        "action": "URI",
                        "title": "View snapshot",
                        "uri": f"/api/frigate/notifications/{event}/snapshot.jpg",
                    },
                    {
                        "action": f"{PAUSE_ACTION_PREFIX}{decision.zone_id}",
                        "title": f"Pause {DEFAULT_PAUSE_MINUTES} min",
                        "destructive": True,
                    },
                ],
            },
        }
        for recipient in self._recipients:
            try:
                await self._hass.services.async_call("notify", recipient, data, blocking=True)
            except Exception:
                _LOGGER.exception("Could not send the notification to notify.%s", recipient)

    @callback
    def _on_action(self, event: Event) -> None:
        action = str(event.data.get("action", ""))
        if not action.startswith(PAUSE_ACTION_PREFIX):
            return
        zone_id = action.removeprefix(PAUSE_ACTION_PREFIX)
        if any(zone.id == zone_id for zone in self._zones):
            self._pauses.async_pause(zone_id, timedelta(minutes=DEFAULT_PAUSE_MINUTES))
