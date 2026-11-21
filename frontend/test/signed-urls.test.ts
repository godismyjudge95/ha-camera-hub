import { describe, expect, test } from "bun:test";

import { SignedUrls } from "../src/api/signed-urls";
import type { HomeAssistant } from "../src/ha-types";

function fakeHass() {
  let signatures = 0;
  const hass = {
    hassUrl: (path: string) => `https://ha${path}`,
    callWS: async (message: Record<string, unknown>) => {
      signatures++;
      return { path: `${message.path}?authSig=${signatures}` };
    },
  } as unknown as HomeAssistant;
  return { hass, count: () => signatures };
}

describe("SignedUrls", () => {
  test("reuses a signature while it is fresh", async () => {
    let now = 0;
    const urls = new SignedUrls(() => now);
    const { hass, count } = fakeHass();

    const first = await urls.get(hass, "/thumb.webp");
    now = 30 * 60 * 1000;
    const second = await urls.get(hass, "/thumb.webp");

    expect(second).toBe(first);
    expect(count()).toBe(1);
  });

  test("signs again before the signature expires", async () => {
    let now = 0;
    const urls = new SignedUrls(() => now);
    const { hass, count } = fakeHass();

    await urls.get(hass, "/thumb.webp");
    now = 50 * 60 * 1000;
    const renewed = await urls.get(hass, "/thumb.webp");

    expect(renewed).toBe("https://ha/thumb.webp?authSig=2");
    expect(count()).toBe(2);
  });

  test("does not keep a failed signature", async () => {
    const urls = new SignedUrls(() => 0);
    let fail = true;
    const hass = {
      hassUrl: (path: string) => path,
      callWS: async () => {
        if (fail) throw new Error("offline");
        return { path: "/thumb.webp?authSig=ok" };
      },
    } as unknown as HomeAssistant;

    await expect(urls.get(hass, "/thumb.webp")).rejects.toThrow("offline");
    fail = false;
    expect(await urls.get(hass, "/thumb.webp")).toBe("/thumb.webp?authSig=ok");
  });
});
