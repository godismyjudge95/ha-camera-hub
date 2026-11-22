# Camera Hub

A Home Assistant integration for [Frigate](https://frigate.video) cameras. It gives
you one dashboard card for a wall tablet or a phone, and it sends the phone
notifications for Frigate's person alerts.

**The card:**
- A large live view and a tile for every camera. A tap on a tile shows that
  camera in the large view.
- Recent alerts with filters. A tap plays the clip in a large player.
- Rewind: a vertical timeline of all the camera's recordings, with its alerts
  and detections marked. Scroll it to look for activity; scrolling does not
  change the video. Tap a time or a mark to play from there, and drag the red
  play line to scrub. The day buttons scroll to a day. On a tablet the
  timeline replaces the tiles; the rewind button opens it.
- Live video plays the camera's main stream. If a device cannot decode it
  (for example an older tablet and a 2304x1296 stream), the card plays the
  camera's detect stream instead. Web views without MSE and WebRTC (for
  example the Home Assistant app for macOS) play Home Assistant's own HLS
  stream, which starts slower and runs a few seconds behind live.
- Push to talk (hold the microphone button), and pan and tilt.
- The card returns to its default camera when nobody touches it. The pin
  button keeps the camera on screen until you tap it again or reload.
- Pauses of the notifications, per zone. On a tablet they open from the
  "Phone alerts" button next to the recent alerts.
- On a tablet, "Hide" folds the camera grid into a narrow button at the edge,
  so the main video gets more room. Each device remembers it.
- A doorbell screen over every card when the doorbell rings or a person comes
  to the door.

On a phone (a card narrower than 700 px) the video stays at the top with its
controls under it, and tabs switch between the cameras, a list of alerts
grouped by day, the timeline, and the pauses. A tap on an alert plays it in the video at the
top.

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
- A person-at-the-door sensor shows it only when none is showing, the last one
  is longer ago than the cooldown, and the zone of the doorbell camera is not
  paused. So a pause of that zone also stops these takeovers; a ring still shows.
- The card closes the doorbell after 60 seconds without a touch, and never while
  someone talks.

With a wall tablet that runs the Home Assistant Companion app on Android, Camera
Hub turns its screen on, and the card opens the dashboard path you set inside the
running app, without a reload. The app must stay open (for example as the home
app), signed in as the user that registered the tablet's app.

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

## Logs

The card writes what it does to the browser console, with the prefix
`Camera Hub`. It also sends its warnings and errors to the Home Assistant log,
with the user and the browser, so a failure on a wall tablet or a phone shows
in **Settings › System › Logs** (logger `custom_components.camera_hub.card`).
A repeated message is sent at most once a minute.

For more detail in the console of one device, run
`localStorage.setItem("camera-hub-debug", "1")` there and reload.

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
