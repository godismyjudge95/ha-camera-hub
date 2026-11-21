"""Tests for the notification rules."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from custom_components.camera_hub.engine import (
    Burst,
    Context,
    EngineConfig,
    Notify,
    ReviewMessage,
    Skip,
    ZoneRule,
    decide,
)

T0 = datetime(2026, 11, 21, 12, 0, tzinfo=UTC)

CONFIG = EngineConfig(
    zones=(
        ZoneRule(
            id="front",
            cameras=frozenset({"doorbell", "driveway", "side"}),
            priority=frozenset({"doorbell"}),
            notify=True,
        ),
        ZoneRule(id="inside", cameras=frozenset({"nursery"}), priority=frozenset(), notify=False),
    )
)


def message(
    camera: str,
    kind: str = "new",
    review: str = "r1",
    event: str | None = None,
    objects: tuple[str, ...] = ("person",),
    sub_labels: tuple[str, ...] = (),
) -> ReviewMessage:
    return ReviewMessage(
        type=kind,
        review_id=review,
        camera=camera,
        objects=objects,
        sub_labels=sub_labels,
        event_id=event or f"event-{review}",
    )


def context(
    now: datetime = T0, paused: frozenset[str] = frozenset(), home: frozenset[str] = frozenset()
) -> Context:
    return Context(now=now, paused=paused, faces_at_home=home)


def test_first_review_starts_a_burst_with_its_own_tag() -> None:
    state, decision = decide(message("driveway"), CONFIG, {}, context())

    assert decision == Notify("front", "driveway", "event-r1", "event-r1", True)
    assert state["front"] == Burst("driveway", "event-r1", "event-r1", T0)


@pytest.mark.parametrize(
    ("review", "ctx", "reason"),
    [
        (message("driveway", kind="genai"), context(), "not a review change"),
        (message("garage"), context(), "camera is in no zone"),
        (message("nursery"), context(), "zone sends no notifications"),
        (message("driveway", objects=("car",)), context(), "no watched object"),
        (message("driveway"), context(paused=frozenset({"front"})), "zone is paused"),
        (
            message("driveway", sub_labels=("daniel",)),
            context(home=frozenset({"daniel"})),
            "only faces of people at home",
        ),
    ],
)
def test_reviews_that_do_not_notify(review: ReviewMessage, ctx: Context, reason: str) -> None:
    state, decision = decide(review, CONFIG, {}, ctx)

    assert isinstance(decision, Skip)
    assert decision.reason == reason
    assert state == {}


def test_a_face_of_someone_away_still_notifies() -> None:
    review = message("driveway", sub_labels=("daniel", "miriam"))

    _, decision = decide(review, CONFIG, {}, context(home=frozenset({"daniel"})))

    assert isinstance(decision, Notify)


def test_verified_objects_count_as_their_base_object() -> None:
    _, decision = decide(message("driveway", objects=("person-verified",)), CONFIG, {}, context())

    assert isinstance(decision, Notify)


def test_a_new_review_in_the_burst_takes_over_and_keeps_the_tag() -> None:
    state, _ = decide(message("driveway", review="r1"), CONFIG, {}, context())

    state, decision = decide(
        message("side", review="r2"), CONFIG, state, context(T0 + timedelta(seconds=20))
    )

    assert decision == Notify("front", "side", "event-r2", "event-r1", False)


def test_a_priority_camera_keeps_the_notification() -> None:
    state, _ = decide(message("doorbell", review="r1"), CONFIG, {}, context())

    state, decision = decide(
        message("driveway", review="r2"), CONFIG, state, context(T0 + timedelta(seconds=20))
    )

    assert decision == Skip("another camera has the notification", "front")
    # The skipped review still keeps the burst going.
    assert state["front"].last_review == T0 + timedelta(seconds=20)
    assert state["front"].winner == "doorbell"


def test_a_priority_camera_takes_over_from_another_camera() -> None:
    state, _ = decide(message("driveway", review="r1"), CONFIG, {}, context())

    _, decision = decide(
        message("doorbell", review="r2"), CONFIG, state, context(T0 + timedelta(seconds=20))
    )

    assert decision == Notify("front", "doorbell", "event-r2", "event-r1", False)


def test_updates_of_the_winner_refresh_the_notification() -> None:
    state, _ = decide(message("driveway", review="r1"), CONFIG, {}, context())

    _, decision = decide(
        message("driveway", kind="update", review="r1", event="event-r1"),
        CONFIG,
        state,
        context(T0 + timedelta(seconds=5)),
    )

    assert decision == Notify("front", "driveway", "event-r1", "event-r1", False)


def test_updates_of_other_cameras_do_not_take_over() -> None:
    state, _ = decide(message("driveway", review="r1"), CONFIG, {}, context())

    _, decision = decide(
        message("side", kind="update", review="r2"),
        CONFIG,
        state,
        context(T0 + timedelta(seconds=5)),
    )

    assert decision == Skip("another camera has the notification", "front")


def test_after_the_quiet_window_a_review_starts_a_new_burst() -> None:
    state, _ = decide(message("driveway", review="r1"), CONFIG, {}, context())

    _, decision = decide(
        message("driveway", review="r2"),
        CONFIG,
        state,
        context(T0 + timedelta(minutes=3, seconds=1)),
    )

    assert decision == Notify("front", "driveway", "event-r2", "event-r2", True)


def test_parse_reads_frigate_review_messages() -> None:
    payload = {
        "type": "update",
        "before": {},
        "after": {
            "id": "1795284477.938695-zn094a",
            "camera": "back_yard_garden",
            "severity": "alert",
            "data": {
                "detections": ["1795284476.942441-x1457t"],
                "objects": ["person"],
                "sub_labels": [["Daniel", 0.91]],
            },
        },
    }

    assert ReviewMessage.parse(payload) == ReviewMessage(
        type="update",
        review_id="1795284477.938695-zn094a",
        camera="back_yard_garden",
        objects=("person",),
        sub_labels=("daniel",),
        event_id="1795284476.942441-x1457t",
    )


def test_parse_ignores_messages_without_a_review() -> None:
    assert ReviewMessage.parse({"type": "new"}) is None
    assert ReviewMessage.parse({"type": "new", "after": {"id": "x"}}) is None
