"""Decides which Frigate reviews become phone notifications.

This module has no Home Assistant imports: it works on plain data, so every
rule here is testable on its own. The notifier feeds it Frigate's review
messages with the current time, pauses and who is home, and acts on the
decision it returns.

The rules:
- A review counts when it is about a watched object (a person, by default),
  on a camera of a zone that sends notifications, in a zone that is not
  paused, and is not only a recognised face of someone who is at home.
- Reviews in a zone form a burst. Each review that counts keeps the burst
  going for the quiet window. A burst is one phone notification: every
  notification of the burst has the same tag, so the phone updates it in
  place instead of alerting again.
- The notification shows the burst's winner camera. A new review takes it
  over unless the winner is a priority camera and the new review's camera is
  not. Updates of the winner's own review refresh the notification, for
  example with a better image.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Any


@dataclass(frozen=True, slots=True)
class ZoneRule:
    """A zone as the engine sees it."""

    id: str
    cameras: frozenset[str]
    # Frigate camera names whose reviews keep the notification over others.
    priority: frozenset[str]
    notify: bool


@dataclass(frozen=True, slots=True)
class EngineConfig:
    """The rules of the engine."""

    zones: tuple[ZoneRule, ...]
    quiet_window: timedelta = timedelta(minutes=3)
    labels: frozenset[str] = frozenset({"person"})

    def zone_of(self, camera: str) -> ZoneRule | None:
        """Return the first zone that holds the Frigate camera."""
        return next((zone for zone in self.zones if camera in zone.cameras), None)


@dataclass(frozen=True, slots=True)
class Context:
    """What the engine needs to know about now."""

    now: datetime
    paused: frozenset[str]
    # Lower-case names of recognised faces whose person is at home.
    faces_at_home: frozenset[str]


@dataclass(frozen=True, slots=True)
class ReviewMessage:
    """One message of Frigate's `reviews` MQTT topic."""

    type: str
    review_id: str
    camera: str
    objects: tuple[str, ...]
    sub_labels: tuple[str, ...]
    # The first tracked object of the review: Frigate's notification images
    # and clips are per tracked object.
    event_id: str

    @classmethod
    def parse(cls, payload: Mapping[str, Any]) -> ReviewMessage | None:
        """Read a message, or return None if it is not a usable review."""
        after = payload.get("after")
        if not isinstance(after, Mapping):
            return None
        review_id = after.get("id")
        camera = after.get("camera")
        if not isinstance(review_id, str) or not isinstance(camera, str):
            return None
        data = after.get("data") if isinstance(after.get("data"), Mapping) else {}
        detections = [item for item in data.get("detections") or [] if isinstance(item, str)]
        return cls(
            type=str(payload.get("type", "")),
            review_id=review_id,
            camera=camera,
            objects=tuple(str(item) for item in data.get("objects") or []),
            sub_labels=tuple(_label_name(item) for item in data.get("sub_labels") or []),
            event_id=detections[0] if detections else review_id,
        )


def _label_name(item: Any) -> str:
    # Frigate sends sub labels as names, and older versions as [name, score].
    if isinstance(item, (list, tuple)) and item:
        item = item[0]
    return str(item).lower()


@dataclass(frozen=True, slots=True)
class Burst:
    """The current burst of a zone."""

    winner: str
    event_id: str
    tag: str
    last_review: datetime


@dataclass(frozen=True, slots=True)
class Notify:
    """Send or update the zone's notification."""

    zone_id: str
    camera: str
    event_id: str
    tag: str
    # False when the notification only replaces one already on the phone.
    new_burst: bool


@dataclass(frozen=True, slots=True)
class Skip:
    """No notification, and why."""

    reason: str
    zone_id: str | None = None


type Decision = Notify | Skip
type EngineState = Mapping[str, Burst]


def decide(
    message: ReviewMessage, config: EngineConfig, state: EngineState, context: Context
) -> tuple[EngineState, Decision]:
    """Return the new state and what to do with the review."""
    if message.type not in ("new", "update", "end"):
        return state, Skip("not a review change")
    zone = config.zone_of(message.camera)
    if zone is None:
        return state, Skip("camera is in no zone")
    if not zone.notify:
        return state, Skip("zone sends no notifications", zone.id)
    if not any(_base(obj) in config.labels for obj in message.objects):
        return state, Skip("no watched object", zone.id)
    if zone.id in context.paused:
        return state, Skip("zone is paused", zone.id)
    if message.sub_labels and all(label in context.faces_at_home for label in message.sub_labels):
        return state, Skip("only faces of people at home", zone.id)

    burst = state.get(zone.id)
    if burst is not None and context.now - burst.last_review > config.quiet_window:
        burst = None

    new_state = dict(state)
    if burst is None:
        new_state[zone.id] = Burst(message.camera, message.event_id, message.event_id, context.now)
        return new_state, Notify(zone.id, message.camera, message.event_id, message.event_id, True)

    if message.type == "new":
        takes_over = message.camera in zone.priority or burst.winner not in zone.priority
    else:
        takes_over = message.camera == burst.winner
    if not takes_over:
        new_state[zone.id] = replace(burst, last_review=context.now)
        return new_state, Skip("another camera has the notification", zone.id)

    new_state[zone.id] = Burst(message.camera, message.event_id, burst.tag, context.now)
    return new_state, Notify(zone.id, message.camera, message.event_id, burst.tag, False)


def _base(label: str) -> str:
    # Frigate can name a verified object, for example "person-verified".
    return label.split("-", 1)[0]
