import { describe, expect, test } from "bun:test";

import { IdleTimer } from "../src/idle";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("IdleTimer", () => {
  test("calls back after the timeout", async () => {
    let calls = 0;
    const timer = new IdleTimer(() => calls++);
    timer.setTimeout(0.02);
    await wait(40);
    expect(calls).toBe(1);
  });

  test("does not run while held, also after a restart", async () => {
    let calls = 0;
    const timer = new IdleTimer(() => calls++);
    timer.setTimeout(0.02);
    timer.hold(true);
    timer.restart();
    await wait(40);
    expect(calls).toBe(0);

    timer.hold(false);
    await wait(40);
    expect(calls).toBe(1);
  });
});
