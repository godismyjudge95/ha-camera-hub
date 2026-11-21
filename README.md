# Camera Hub

A Home Assistant integration that gives [Frigate](https://frigate.video) cameras one
dashboard card for a wall tablet or a phone: a large live view, camera tiles,
recent clips, a doorbell screen, and notification controls.

**Status:** early development. Live view, camera tiles, recent alerts, rewind, push to talk and pan/tilt work now.

## Requirements

- Home Assistant 2026.10 or later
- The [Frigate integration](https://github.com/blakeblackshear/frigate-hass-integration)
  (tested with 5.15) and Frigate 0.18
- MQTT, set up in Home Assistant

## Install

1. In Home Assistant, open **Settings** > **Marketplace** and add this repository
   as a custom repository (category: integration).
2. Install **Camera Hub** and restart Home Assistant.
3. Open **Settings** > **Devices & services** > **Add integration** > **Camera Hub**.
   Select your Frigate cameras and the default camera.
4. Add the card to a dashboard:

   ```yaml
   type: custom:camera-hub-card
   ```

The integration loads the card on every dashboard. You do not add a resource.

## How live video works

The card plays each camera's go2rtc restream from Frigate through the Frigate
integration's proxy in Home Assistant, so it also works away from home. It
uses MSE first: MSE starts as fast as WebRTC and also plays high-level H.264
streams (for example 2960x1668 at level 5.0) that browsers often do not decode
over WebRTC. WebRTC, with the ICE servers Home Assistant provides (with Home
Assistant Cloud these include TURN relays), is the second choice. A mode that
shows no picture within 6 seconds makes the card try the other one.

While a stream connects, the main view shows the camera's latest still.

## Player controls

- **Live:** sound, push to talk (cameras whose go2rtc stream has a backchannel),
  pan and tilt (cameras Frigate controls over ONVIF), rewind, and full screen.
- **Rewind and clips:** play and pause, a seek bar, 10 seconds back and forward,
  1x/2x/4x speed, sound, and full screen. The card plays Frigate's HLS recordings
  with its own small fMP4 player and loads only the segments near the play
  position.

Push to talk needs Home Assistant over HTTPS, because browsers allow the
microphone only on secure pages.

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
.venv/bin/pytest
```

The built card is committed, so the repository installs without a build step.
CI fails if the committed bundle does not match the source.
