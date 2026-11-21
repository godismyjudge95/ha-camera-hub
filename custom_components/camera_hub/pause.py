"""Pauses of zone notifications.

The pause manager is the one place that knows which zones are paused. It
saves each pause's end time, so a pause survives a restart, and it ends each
pause on time by itself.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

STORAGE_VERSION = 1
STORAGE_KEY = "camera_hub.pauses"


class PauseManager:
    """Keeps the end time of each paused zone."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, str]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._until: dict[str, datetime] = {}
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Restore the pauses that have not ended yet."""
        now = dt_util.utcnow()
        for zone_id, value in (await self._store.async_load() or {}).items():
            until = dt_util.parse_datetime(value)
            if until and until > now:
                self._set(zone_id, until)

    @callback
    def async_unload(self) -> None:
        """Cancel the end-of-pause timers."""
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()

    def paused_until(self, zone_id: str) -> datetime | None:
        """Return when the zone's pause ends, or None if it is not paused."""
        until = self._until.get(zone_id)
        return until if until and until > dt_util.utcnow() else None

    def is_paused(self, zone_id: str) -> bool:
        """Return True while the zone is paused."""
        return self.paused_until(zone_id) is not None

    @callback
    def async_pause(self, zone_id: str, duration: timedelta) -> None:
        """Pause the zone for the duration, from now."""
        self._set(zone_id, dt_util.utcnow() + duration)
        self._changed()

    @callback
    def async_resume(self, zone_id: str) -> None:
        """End the zone's pause now."""
        if zone_id not in self._until:
            return
        self._clear(zone_id)
        self._changed()

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` whenever a pause starts or ends."""
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    def _set(self, zone_id: str, until: datetime) -> None:
        if cancel := self._timers.pop(zone_id, None):
            cancel()
        self._until[zone_id] = until

        @callback
        def _ended(_now: datetime) -> None:
            self._timers.pop(zone_id, None)
            self._clear(zone_id)
            self._changed()

        self._timers[zone_id] = async_track_point_in_utc_time(self._hass, _ended, until)

    def _clear(self, zone_id: str) -> None:
        if cancel := self._timers.pop(zone_id, None):
            cancel()
        self._until.pop(zone_id, None)

    def _changed(self) -> None:
        self._store.async_delay_save(
            lambda: {zone_id: until.isoformat() for zone_id, until in self._until.items()}, 1
        )
        for listener in list(self._listeners):
            listener()
