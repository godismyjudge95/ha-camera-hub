import { expect, test } from "bun:test";

import { errorMessage } from "../src/errors";

test("reads the message of Errors and of Home Assistant's error objects", () => {
  expect(errorMessage(new Error("Could not open the stream connection"))).toBe(
    "Could not open the stream connection",
  );
  expect(errorMessage({ code: "unknown_command", message: "Unknown command." })).toBe("Unknown command.");
  expect(errorMessage("offline")).toBe("offline");
  expect(errorMessage({ code: 3 })).toBe("Something went wrong");
});
