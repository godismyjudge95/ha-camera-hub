// Calls `onIdle` once nobody has touched the card for the configured time.
export class IdleTimer {
  private timer?: ReturnType<typeof setTimeout>;
  private timeoutMs = 0;
  private held = false;

  constructor(private readonly onIdle: () => void) {}

  // 0 seconds turns the timer off.
  setTimeout(seconds: number): void {
    this.timeoutMs = seconds * 1000;
    this.restart();
  }

  restart(): void {
    clearTimeout(this.timer);
    if (this.timeoutMs > 0 && !this.held) this.timer = setTimeout(this.onIdle, this.timeoutMs);
  }

  // While held, the timer does not run: the user pinned the camera on screen.
  hold(held: boolean): void {
    this.held = held;
    this.restart();
  }

  stop(): void {
    clearTimeout(this.timer);
  }
}
