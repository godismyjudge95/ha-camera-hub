"""Constants for Camera Hub."""

from typing import Final

DOMAIN: Final = "camera_hub"

FRIGATE_DOMAIN: Final = "frigate"

CONF_CAMERAS: Final = "cameras"
CONF_DEFAULT_CAMERA: Final = "default_camera"
# Seconds without a touch before the main view goes back to the default
# camera. 0 turns the auto-return off.
CONF_RETURN_AFTER: Final = "return_after_seconds"
DEFAULT_RETURN_AFTER: Final = 120

# A list of zones: {"name", "cameras", "notify"}.
CONF_ZONES: Final = "zones"

# Notifications: who gets them, and whether they are sent.
CONF_RECIPIENTS: Final = "recipients"
CONF_DELIVERY: Final = "delivery"
DELIVERY_OFF: Final = "off"
# Decide as in "live", but only report the decisions as events.
DELIVERY_SHADOW: Final = "shadow"
DELIVERY_LIVE: Final = "live"
CONF_QUIET_WINDOW: Final = "quiet_window_seconds"
DEFAULT_QUIET_WINDOW: Final = 180
# A list of {"sub_label", "person"}: a recognised face and its person entity.
CONF_FACES: Final = "faces"

# The event every notification decision fires.
EVENT_DECISION: Final = "camera_hub_decision"
# The action id prefix of a notification's pause button.
PAUSE_ACTION_PREFIX: Final = "CAMERA_HUB_PAUSE_"

# The doorbell: {"camera", "ring", "person", "person_cooldown_seconds",
# "tablet_notify", "tablet_path"}.
CONF_DOORBELL: Final = "doorbell"
DEFAULT_PERSON_COOLDOWN: Final = 120

# A zone name that stands for every zone in the pause services.
ALL_ZONES: Final = "all"
DEFAULT_PAUSE_MINUTES: Final = 30

# The card bundle is served from this URL base by the integration itself.
FRONTEND_URL_BASE: Final = "/camera_hub_static"
CARD_FILENAME: Final = "camera-hub-card.js"
