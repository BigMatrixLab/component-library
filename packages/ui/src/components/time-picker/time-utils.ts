/**
 * Time helpers for TimePicker. A time of day is a string `"HH:mm"` (or
 * `"HH:mm:ss"` with seconds), 24-hour, zero-padded — the format of
 * `<input type="time">` and of a form field.
 */

export interface TimeParts {
  /** 0–23 */
  hour: number;
  /** 0–59 */
  minute: number;
  /** 0–59 */
  second: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Parse "HH:mm" or "HH:mm:ss" (also "H:mm"). Null for anything that is not a real time. */
export function parseTimeValue(value: string | null | undefined): TimeParts | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((value ?? '').trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const second = m[3] === undefined ? 0 : Number(m[3]);
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { hour, minute, second };
}

/** "09:05" or, with seconds, "09:05:30". */
export function formatTimeValue(parts: TimeParts, seconds = false): string {
  const base = `${pad(parts.hour)}:${pad(parts.minute)}`;
  return seconds ? `${base}:${pad(parts.second)}` : base;
}

/** Seconds since midnight, for comparing and sorting. Null when `value` is not a time. */
export function timeToSeconds(value: string | null | undefined): number | null {
  const p = parseTimeValue(value);
  return p ? p.hour * 3600 + p.minute * 60 + p.second : null;
}

/** Negative when a is earlier than b. Unparseable values sort as equal. */
export function compareTimes(a: string, b: string): number {
  return (timeToSeconds(a) ?? 0) - (timeToSeconds(b) ?? 0);
}

/** Whether a locale writes a 12-hour clock ("3:30 PM") — or `override` when given. */
export function resolveHour12(locale: string | undefined, override?: boolean): boolean {
  if (override !== undefined) return override;
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12';
}

export type DayPeriod = 'AM' | 'PM';

/** 0 → 12 AM, 12 → 12 PM, 15 → 3 PM. */
export function toTwelveHour(hour24: number): { hour: number; period: DayPeriod } {
  return { hour: hour24 % 12 === 0 ? 12 : hour24 % 12, period: hour24 >= 12 ? 'PM' : 'AM' };
}

/** 12 AM → 0, 12 PM → 12, 3 PM → 15. */
export function fromTwelveHour(hour: number, period: DayPeriod): number {
  return (hour % 12) + (period === 'PM' ? 12 : 0);
}

/** The locale's words for AM and PM ("AM" / "PM" in en-US, "a. m." in es). */
export function getDayPeriodLabels(locale: string | undefined): Record<DayPeriod, string> {
  const fmt = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true });
  const label = (h: number, fallback: string) =>
    fmt.formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === 'dayPeriod')?.value ?? fallback;
  return { AM: label(9, 'AM'), PM: label(15, 'PM') };
}

/** A time as the locale writes it: "3:30 PM" or "15:30". */
export function formatTimeLabel(value: string, locale: string | undefined, hour12: boolean, seconds = false): string {
  const p = parseTimeValue(value);
  if (!p) return value;
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' as const } : null),
    hour12,
  }).format(new Date(2000, 0, 1, p.hour, p.minute, p.second));
}

/**
 * Every time from `min` to `max` (inclusive) in steps of `step` minutes.
 * `buildTimeOptions({ step: 15 })` → "00:00", "00:15", … "23:45".
 */
export function buildTimeOptions({
  step = 15,
  min = '00:00',
  max = '23:59',
  seconds = false,
}: {
  step?: number;
  min?: string;
  max?: string;
  seconds?: boolean;
} = {}): string[] {
  const size = Math.max(1, Math.floor(step));
  const from = Math.ceil((timeToSeconds(min) ?? 0) / 60);
  const to = Math.floor((timeToSeconds(max) ?? 86399) / 60);
  const out: string[] = [];
  // Steps count from midnight, so a 15-minute list stays on :00 :15 :30 :45 whatever `min` is
  for (let m = Math.ceil(from / size) * size; m <= to && m < 1440; m += size) {
    out.push(formatTimeValue({ hour: Math.floor(m / 60), minute: m % 60, second: 0 }, seconds));
  }
  return out;
}

/** Index of the last option at or before `value`, else 0. -1 for an empty list. */
export function nearestTimeIndex(options: string[], value: string | null | undefined): number {
  if (!options.length) return -1;
  const target = timeToSeconds(value);
  if (target === null) return 0;
  let found = 0;
  options.forEach((o, i) => {
    if ((timeToSeconds(o) ?? 0) <= target) found = i;
  });
  return found;
}
