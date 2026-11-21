// A readable message for anything thrown or rejected. Home Assistant's
// websocket rejects with plain objects ({ code, message }), not Errors.
export function errorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return typeof error === "string" ? error : "Something went wrong";
}
