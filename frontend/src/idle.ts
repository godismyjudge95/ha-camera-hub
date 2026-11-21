// Calls `onIdle` once nobody has touched the card for the configured time.
export class IdleTimer {
  private timer?: ReturnType<typeof setTimeout>;
  private timeoutMs = 0;

  constructor(private readonly onIdle: () => void) {}

  // 0 seconds turns the timer off.
  setTimeout(seconds: number): void {
    this.timeoutMs = seconds * 1000;
    this.restart();
  }

  restart(): void {
    clearTimeout(this.timer);
    if (this.timeoutMs > 0) this.timer = setTimeout(this.onIdle, this.timeoutMs);
  }

  stop(): void {
    clearTimeout(this.timer);
  }
}
