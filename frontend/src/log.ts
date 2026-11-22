// Logging for the card.
//
// Every message goes to the browser console with a "Camera Hub" prefix.
// Warnings and errors also go to the Home Assistant log (logger
// `custom_components.camera_hub.card`), so a failure on a wall tablet or a
// phone can be read in Settings › System › Logs, without the browser's
// developer tools. Debug messages show in the console only when this device
// has `localStorage["camera-hub-debug"] = "1"`.

import type { HomeAssistant } from "./ha-types";

export type LogLevel = "debug" | "info" | "warning" | "error";
export type LogDetails = Record<string, unknown>;

export interface Logger {
  debug(message: string, details?: LogDetails): void;
  info(message: string, details?: LogDetails): void;
  warn(message: string, details?: LogDetails): void;
  error(message: string, details?: LogDetails): void;
}

// The same message is sent to Home Assistant at most once in this time, and
// no more than MAX_SENT_PER_WINDOW messages in total, so a retry loop cannot
// fill the log.
const REPEAT_MS = 60_000;
const MAX_SENT_PER_WINDOW = 30;

let hass: HomeAssistant | undefined;
const lastSent = new Map<string, number>();
let windowStart = 0;
let sentInWindow = 0;
let remoteUnavailable = false;

// The card gives the logger its Home Assistant connection when it gets one.
export function setLogConnection(connection: HomeAssistant): void {
  hass = connection;
}

function debugEnabled(): boolean {
  try {
    return localStorage.getItem("camera-hub-debug") === "1";
  } catch {
    return false;
  }
}

// `key=value` pairs, for one line in the Home Assistant log.
export function formatDetails(details: LogDetails | undefined): string {
  if (!details) return "";
  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" ");
}

function shouldSend(key: string, now: number): boolean {
  if (now - (lastSent.get(key) ?? -Infinity) < REPEAT_MS) return false;
  if (now - windowStart >= REPEAT_MS) {
    windowStart = now;
    sentInWindow = 0;
  }
  if (sentInWindow >= MAX_SENT_PER_WINDOW) return false;
  lastSent.set(key, now);
  sentInWindow++;
  return true;
}

function sendToHomeAssistant(level: LogLevel, scope: string, message: string, details?: LogDetails): void {
  if (!hass || remoteUnavailable || !shouldSend(`${scope}|${message}`, Date.now())) return;
  hass
    .callWS({
      type: "camera_hub/log",
      level,
      scope,
      message,
      details: formatDetails(details),
      client: navigator.userAgent,
    })
    .catch((error: { code?: string }) => {
      // An older integration does not have the command: stop asking.
      if (error?.code === "unknown_command") remoteUnavailable = true;
    });
}

export function logger(scope: string): Logger {
  const prefix = `Camera Hub [${scope}]`;
  const write = (level: LogLevel, message: string, details?: LogDetails) => {
    const args: unknown[] = details ? [`${prefix} ${message}`, details] : [`${prefix} ${message}`];
    if (level === "debug") {
      if (debugEnabled()) console.debug(...args);
      return;
    }
    if (level === "info") console.info(...args);
    else if (level === "warning") console.warn(...args);
    else console.error(...args);
    if (level === "warning" || level === "error") sendToHomeAssistant(level, scope, message, details);
  };
  return {
    debug: (message, details) => write("debug", message, details),
    info: (message, details) => write("info", message, details),
    warn: (message, details) => write("warning", message, details),
    error: (message, details) => write("error", message, details),
  };
}

// Only for tests.
export function resetLogState(): void {
  hass = undefined;
  lastSent.clear();
  windowStart = 0;
  sentInWindow = 0;
  remoteUnavailable = false;
}
