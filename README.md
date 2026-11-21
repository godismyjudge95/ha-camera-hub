# Camera Hub

A Home Assistant integration for [Frigate](https://frigate.video) cameras. It gives
you one dashboard card for a wall tablet or a phone, and it sends the phone
notifications for Frigate's person alerts.

**The card:**
- A large live view and a tile for every camera. A tap on a tile shows that
  camera in the large view.
- Recent alerts with filters. A tap plays the clip in a large player.
- Rewind: a timeline of the last three hours, with the camera's alerts marked.
- Push to talk, and pan and tilt.
- Pauses of the notifications, per zone.
- A doorbell screen over every card when the doorbell rings or a person comes
  to the door.

**The integration:** one phone notification per burst of person alerts in a
zone. The phone updates that notification in place instead of alerting again.

**Status:** early development (0.x). Expect changes between versions.

## Requirements

- Home Assistant 2026.10 or later
- The [Frigate integration](https://github.com/blakeblackshear/frigate-hass-integration)
  (tested with 5.15) and Frigate 0.18
- MQTT, set up in Home Assistant
- For push to talk: Home Assistant over HTTPS (for example Home Assistant Cloud)

## Install

1. In Home Assistant, open **Settings** > **Marketplace** and add this repository
   as a custom repository (category: integration).
2. Install **Camera Hub** and restart Home Assistant.
3. Open **Settings** > **Devices & services** > **Add integration** > **Camera Hub**.
   Select your Frigate cameras and the default camera.
4. Add the card to a dashboard, for example as the only card of a panel view:

   ```yaml
   type: custom:camera-hub-card
   ```

   Optional: `main_camera: camera.porch` shows another default camera on this card.

The integration loads the card on every dashboard. You do not add a resource.
After an update, a card that a browser or app cached reloads the page once by
itself.

## Settings

Open **Settings** > **Devices & services** > **Camera Hub** > **Configure**.

| Step | What you set |
|---|---|
| **Cameras** | The cameras the card shows. The default camera. After how many seconds without a touch the main view shows the default camera again (0 turns this off). |
| **Zones** | Groups of cameras that share notifications and pauses. Each zone has a name, its cameras, its priority cameras, and whether it sends notifications. |
| **Notifications** | The delivery (off, shadow or live), the notify services that get the notifications, the quiet window, and the recognised faces. |
| **Doorbell** | The doorbell camera, the doorbell button sensors, the person-at-the-door sensors, the person cooldown, and a wall tablet to wake. |

### Notifications

Camera Hub listens to Frigate's `reviews` MQTT topic. A Frigate alert counts when:
- it is about a person,
- it comes from a camera in a zone that sends notifications,
- that zone is not paused, and
- it is not only a recognised face of someone who is at home. You map Frigate
  face names to person entities in the Notifications step.

The alerts of a zone form a burst. Each counted alert keeps the burst going for
the quiet window (3 minutes by default). A burst is one notification: every
update of it has the same tag, so the phone updates the notification in place.
The notification shows the camera that saw the person last, but a priority
camera, for example a doorbell, keeps the notification over the zone's other
cameras.

Each notification has buttons to view the clip, to view the snapshot, and to
pause the zone for 30 minutes.

**Shadow delivery** decides as live delivery does, but sends nothing. It fires
a `camera_hub_decision` event for each decision. Use it to compare Camera Hub
with your current notification setup before you switch to live. The
diagnostics also list the last 50 decisions.

### Doorbell

- A press on a doorbell button sensor always shows the doorbell on every Camera
  Hub card.
- A person-at-the-door sensor shows it only when none is showing and the last
  one is longer ago than the cooldown.
- The card closes the doorbell after 60 seconds without a touch, and never while
  someone talks.

With a wall tablet that runs the Home Assistant Companion app on Android, Camera
Hub turns its screen on and opens the dashboard path you set.

## Entities and services

| Entity | |
|---|---|
| `switch.camera_hub_<zone>_alerts` | On while the zone's notifications are on. Off pauses the zone for 30 minutes. |
| `sensor.camera_hub_<zone>_paused_until` | When the zone's pause ends. |
| `binary_sensor.camera_hub_doorbell` | On while the doorbell shows. Its attributes say what started it and when. |
| `event.camera_hub_doorbell` | Fires `ring` or `person`, for your automations. |

| Service | |
|---|---|
| `camera_hub.pause_zone` | Pause a zone, or `all`, for some minutes. |
| `camera_hub.resume_zone` | End the pause of a zone, or of `all`. |
| `camera_hub.dismiss_doorbell` | Close the doorbell on every card. |
| `camera_hub.test_doorbell` | Show the doorbell as if it rang. |

## How video works

The card plays each camera's go2rtc restream from Frigate through the Frigate
integration's proxy in Home Assistant, so it also works away from home.

- **Live video:** MSE first. MSE starts as fast as WebRTC and also plays
  high-level H.264 streams (for example 2960x1668 at level 5.0) that browsers
  often do not decode over WebRTC. WebRTC is the second choice, with the ICE
  servers that Home Assistant provides (with Home Assistant Cloud these include
  TURN relays). A mode that shows no picture within 6 seconds makes the card try
  the other one. While a stream connects, the main view shows the camera's
  latest still.
- **Recordings and clips:** played from Frigate's HLS playlists by a small fMP4
  player in the card. It loads only the segments near the play position.
- **Push to talk:** a separate send-only WebRTC connection to the camera's go2rtc
  backchannel, so the video keeps playing. Camera Hub offers talk for cameras
  whose stream has a `backchannel=1` source in Frigate's go2rtc config, and pan
  and tilt for cameras with ONVIF in Frigate's config.

## Development

Frontend (needs [Bun](https://bun.sh)):

```sh
cd frontend
bun install
bun run typecheck
bun test
bun run build   # writes custom_components/camera_hub/frontend/camera-hub-card.js
```

Integration tests (Python 3.14):

```sh
python3.14 -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/ruff check . && .venv/bin/pytest
```

The built card is committed, so the repository installs without a build step.
CI fails if the committed bundle does not match the source.
