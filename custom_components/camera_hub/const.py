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

# The card bundle is served from this URL base by the integration itself.
FRONTEND_URL_BASE: Final = "/camera_hub_static"
CARD_FILENAME: Final = "camera-hub-card.js"
