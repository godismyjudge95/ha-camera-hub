# Camera Hub

A Home Assistant integration that gives [Frigate](https://frigate.video) cameras one
dashboard card for a wall tablet or a phone: a large live view, camera tiles,
recent clips, a doorbell screen, and notification controls.

**Status:** early development (0.0.x). The live view and the camera tiles work now.

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

The card plays go2rtc streams from Frigate through the Frigate integration's
proxy in Home Assistant. It tries WebRTC first, with the ICE servers that Home
Assistant provides (with Home Assistant Cloud, these include TURN relays, so
WebRTC also works away from home). If WebRTC does not connect within 5 seconds,
the card uses MSE over the same connection.

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
