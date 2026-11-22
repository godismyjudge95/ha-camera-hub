// The websocket of go2rtc's API, through the Frigate integration's proxy in
// Home Assistant. The live player and the talk connection both use it.

import { signPath } from "../api/ha";
import type { HomeAssistant } from "../ha-types";
import { logger } from "../log";

const log = logger("go2rtc");

export interface StreamSource {
  instanceId: string;
  stream: string;
  // A Frigate camera entity, used to ask Home Assistant for ICE servers.
  iceEntityId: string;
}

export async function openSocket(hass: HomeAssistant, source: StreamSource): Promise<WebSocket> {
  const path =
    `/api/frigate/${encodeURIComponent(source.instanceId)}/go2rtc/ws/api/ws` +
    `?src=${encodeURIComponent(source.stream)}`;
  const url = (await signPath(hass, path)).replace(/^http/, "ws");
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";
  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () =>
      reject(new Error(`Could not open the stream connection to ${source.stream} through Home Assistant`));
  });
  ws.onerror = null;
  return ws;
}

export function send(ws: WebSocket, type: string, value: string): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, value }));
}

export function waitForConnection(pc: RTCPeerConnection, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`WebRTC did not connect in ${timeoutMs / 1000} s (ICE state: ${pc.iceConnectionState})`)),
      timeoutMs,
    );
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        clearTimeout(timer);
        resolve();
      } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        clearTimeout(timer);
        reject(new Error(`WebRTC failed (ICE state: ${pc.iceConnectionState})`));
      }
    };
  });
}

// Exchanges a WebRTC offer, answer and ICE candidates over the socket.
export async function negotiate(ws: WebSocket, pc: RTCPeerConnection): Promise<void> {
  pc.onicecandidate = (event) => send(ws, "webrtc/candidate", event.candidate?.candidate ?? "");
  ws.addEventListener("message", (event) => {
    if (typeof event.data !== "string") return;
    const message = JSON.parse(event.data) as { type: string; value: string };
    if (message.type === "webrtc/answer") {
      void pc.setRemoteDescription({ type: "answer", sdp: message.value });
    } else if (message.type === "webrtc/candidate" && message.value) {
      void pc.addIceCandidate({ candidate: message.value, sdpMid: "0" });
    } else if (message.type === "error") {
      log.warn(`go2rtc refused the WebRTC offer: ${message.value}`);
      pc.close();
    }
  });
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  send(ws, "webrtc/offer", offer.sdp ?? "");
}
