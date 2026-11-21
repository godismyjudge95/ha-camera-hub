// Arithmetic of the vertical timeline. Times are epoch seconds. The newest
// time is at the top: a time's distance below the top grows with its age.

export interface RecordingDay {
  // Local date, "YYYY-MM-DD".
  day: string;
  // Local hours (0-23) that have recordings.
  hours: number[];
}

// Frigate's recordings summary, as the Frigate integration returns it.
export interface FrigateRecordingDay {
  day: string;
  hours: Array<{ hour: string }>;
}

export function parseRecordingSummary(days: FrigateRecordingDay[]): RecordingDay[] {
  return days
    .map((day) => ({
      day: day.day,
      hours: day.hours.map((hour) => Number.parseInt(hour.hour, 10)).sort((a, b) => a - b),
    }))
    .sort((a, b) => (a.day < b.day ? 1 : -1));
}

// The epoch seconds of a local date and hour.
export function localTime(day: string, hour = 0): number {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, hour).getTime() / 1000;
}

export function localDay(epochSeconds: number): string {
  const date = new Date(epochSeconds * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The time ranges that have recordings, newest first, with neighbouring
// hours joined.
export function recordedRanges(days: RecordingDay[]): Array<[number, number]> {
  const starts = days
    .flatMap((day) => day.hours.map((hour) => localTime(day.day, hour)))
    .sort((a, b) => a - b);
  const ranges: Array<[number, number]> = [];
  for (const start of starts) {
    const last = ranges.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], start + 3600);
    else ranges.push([start, start + 3600]);
  }
  return ranges.reverse();
}

export interface Scale {
  // The time at the top of the timeline.
  top: number;
  pixelsPerHour: number;
}

export function offsetOf(scale: Scale, time: number): number {
  return ((scale.top - time) / 3600) * scale.pixelsPerHour;
}

export function timeAt(scale: Scale, offset: number): number {
  return scale.top - (offset / scale.pixelsPerHour) * 3600;
}

// The full hours between two times, newest first.
export function hoursBetween(newest: number, oldest: number): number[] {
  const hours: number[] = [];
  const first = new Date(newest * 1000);
  first.setMinutes(0, 0, 0);
  for (let time = first.getTime() / 1000; time >= oldest; time -= 3600) hours.push(time);
  return hours;
}
