import { afterEach, describe, expect, test } from "bun:test";

import type { HomeAssistant } from "../src/ha-types";
import { formatDetails, logger, resetLogState, setLogConnection } from "../src/log";

function recordingHass(): { hass: HomeAssistant; sent: Array<Record<string, unknown>> } {
  const sent: Array<Record<string, unknown>> = [];
  const hass = {
    callWS: (message: Record<string, unknown>) => {
      sent.push(message);
      return Promise.resolve();
    },
  } as unknown as HomeAssistant;
  return { hass, sent };
}

const quiet = { warn: console.warn, error: console.error, info: console.info };

afterEach(() => {
  resetLogState();
  Object.assign(console, quiet);
});

function silenceConsole(): void {
  console.warn = () => undefined;
  console.error = () => undefined;
  console.info = () => undefined;
}

describe("formatDetails", () => {
  test("writes key=value pairs and leaves out empty values", () => {
    expect(formatDetails({ codecs: "avc1.640033", code: 3, missing: undefined, empty: "" })).toBe(
      "codecs=avc1.640033 code=3",
    );
  });
});

describe("logger", () => {
  test("sends warnings and errors to Home Assistant, not info", () => {
    silenceConsole();
    const { hass, sent } = recordingHass();
    setLogConnection(hass);
    const log = logger("recording");

    log.info("Loading a recording");
    log.error("A recording did not play", { media_error_code: 3 });

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      type: "camera_hub/log",
      level: "error",
      scope: "recording",
      message: "A recording did not play",
      details: "media_error_code=3",
    });
  });

  test("sends a repeated message only once a minute", () => {
    silenceConsole();
    const { hass, sent } = recordingHass();
    setLogConnection(hass);
    const log = logger("live");

    log.warn("Live video of nursery failed", { attempt: 1 });
    log.warn("Live video of nursery failed", { attempt: 2 });
    log.warn("Live video of porch failed");

    expect(sent.map((message) => message.message)).toEqual([
      "Live video of nursery failed",
      "Live video of porch failed",
    ]);
  });

  test("sends no more than 30 messages a minute", () => {
    silenceConsole();
    const { hass, sent } = recordingHass();
    setLogConnection(hass);
    const log = logger("live");

    for (let i = 0; i < 40; i++) log.warn(`Failure ${i}`);

    expect(sent).toHaveLength(30);
  });
});
