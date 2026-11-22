"""The doorbell takeover: who is at the door, shown on every Camera Hub card.

A press on the doorbell button always starts a takeover. A person at the
door starts one only when none is showing, the last one is a cooldown ago,
and the notifications of the doorbell camera's zone are not paused. So
someone who waits at the door does not restart it over and over, and a
pause of the zone also stops these takeovers.
The card ends the takeover when it is dismissed or nobody touches it; a
server-side limit ends it in any case.

A wall tablet with the Home Assistant Companion app is woken on each
takeover. The card, which loads on every page, then opens the Camera Hub
dashboard inside the running app. The Companion app's `command_webview`
is not used: it loads the whole app again, which takes about 10 seconds on
a slow tablet and looks like a crash.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

from homeassistant.const import STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

TRIGGER_RING = "ring"
TRIGGER_PERSON = "person"

# The card closes the takeover earlier; this only stops one left open.
SAFETY_LIMIT = timedelta(minutes=5)


@dataclass(frozen=True, slots=True)
class DoorbellConfig:
    """How the doorbell is set up."""

    camera: str
    ring_entities: tuple[str, ...]
    person_entities: tuple[str, ...]
    person_cooldown: timedelta
    tablet_notify: str | None
    tablet_path: str | None


@dataclass(frozen=True, slots=True)
class Takeover:
    """A takeover that is showing."""

    trigger: str
    started_at: datetime


class DoorbellCoordinator:
    """Starts and ends doorbell takeovers."""

    def __init__(
        self,
        hass: HomeAssistant,
        config: DoorbellConfig,
        is_paused: Callable[[], bool] = lambda: False,
    ) -> None:
        self._hass = hass
        self.config = config
        # True while the doorbell camera's zone is paused.
        self._is_paused = is_paused
        self.takeover: Takeover | None = None
        self._last_started: datetime | None = None
        self._listeners: list[Callable[[str | None], None]] = []
        self._unsubscribe: list[CALLBACK_TYPE] = []
        self._limit: CALLBACK_TYPE | None = None

    @callback
    def async_start(self) -> None:
        """Watch the doorbell's sensors."""
        entities = [*self.config.ring_entities, *self.config.person_entities]
        if entities:
            self._unsubscribe.append(
                async_track_state_change_event(self._hass, entities, self._on_sensor)
            )

    @callback
    def async_stop(self) -> None:
        """Stop watching, and cancel the safety limit."""
        while self._unsubscribe:
            self._unsubscribe.pop()()
        if self._limit:
            self._limit()
            self._limit = None

    @callback
    def async_add_listener(self, listener: Callable[[str | None], None]) -> CALLBACK_TYPE:
        """Call `listener` with the trigger when a takeover starts, and None when it ends."""
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    @callback
    def _on_sensor(self, event: Event[EventStateChangedData]) -> None:
        new = event.data["new_state"]
        old = event.data["old_state"]
        if new is None or new.state != STATE_ON or (old is not None and old.state == STATE_ON):
            return
        trigger = TRIGGER_RING if new.entity_id in self.config.ring_entities else TRIGGER_PERSON
        self.async_trigger(trigger)

    @callback
    def async_trigger(self, trigger: str) -> None:
        """Start a takeover, or renew the one showing."""
        now = dt_util.utcnow()
        if trigger == TRIGGER_PERSON and (
            self.takeover is not None
            or (self._last_started and now - self._last_started < self.config.person_cooldown)
            or self._is_paused()
        ):
            return
        self.takeover = Takeover(trigger=trigger, started_at=now)
        self._last_started = now
        if self._limit:
            self._limit()
        self._limit = async_call_later(self._hass, SAFETY_LIMIT, self._on_limit)
        for listener in list(self._listeners):
            listener(trigger)
        self._hass.async_create_task(self._async_wake_tablet())

    @callback
    def async_dismiss(self) -> None:
        """End the takeover."""
        if self.takeover is None:
            return
        self.takeover = None
        if self._limit:
            self._limit()
            self._limit = None
        for listener in list(self._listeners):
            listener(None)

    @callback
    def _on_limit(self, _now: datetime) -> None:
        self._limit = None
        self.async_dismiss()

    async def _async_wake_tablet(self) -> None:
        """Turn the tablet's screen on; the card opens the dashboard."""
        service = self.config.tablet_notify
        if not service:
            return
        try:
            await self._hass.services.async_call(
                "notify", service, {"message": "command_screen_on"}, blocking=True
            )
        except Exception:
            _LOGGER.exception("Could not wake the tablet with notify.%s", service)
