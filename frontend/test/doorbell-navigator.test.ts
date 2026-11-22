import { describe, expect, test } from "bun:test";

import { stateInMessage } from "../src/doorbell-navigator";

const ENTITY = "binary_sensor.camera_hub_doorbell";

describe("stateInMessage", () => {
  test("reads the state from the first message", () => {
    expect(stateInMessage({ a: { [ENTITY]: { s: "on" } } }, ENTITY)).toBe("on");
  });

  test("reads a changed state", () => {
    expect(stateInMessage({ c: { [ENTITY]: { "+": { s: "on" } } } }, ENTITY)).toBe("on");
  });

  test("ignores a change of the attributes only", () => {
    expect(stateInMessage({ c: { [ENTITY]: { "+": {} } } }, ENTITY)).toBeUndefined();
  });

  test("ignores other entities", () => {
    expect(stateInMessage({ a: { "binary_sensor.other": { s: "on" } } }, ENTITY)).toBeUndefined();
  });
});
