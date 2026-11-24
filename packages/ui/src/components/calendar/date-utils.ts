/**
 * Date helpers for Calendar (and the Phase 2 date picker).
 * Plain `Date` objects, always at local midnight, so DST and time zones never
 * shift a day: every function builds dates from (year, month, day) parts.
 */

/** 0 = Sunday … 6 = Saturday. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A list of dates, or a predicate, used to disable days. */
export type DateMatcher = Date[] | ((date: Date) => boolean);

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const getDaysInMonth = (d: Date): number => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** Add months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), getDaysInMonth(first)));
}

export const addYears = (d: Date, n: number): Date => addMonths(d, n * 12);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Compare by calendar day: negative when a is before b, 0 when the same day. */
export const compareDays = (a: Date, b: Date): number =>
  a.getFullYear() - b.getFullYear() || a.getMonth() - b.getMonth() || a.getDate() - b.getDate();

export const isBefore = (a: Date, b: Date): boolean => compareDays(a, b) < 0;
export const isAfter = (a: Date, b: Date): boolean => compareDays(a, b) > 0;

/** Inclusive; `a` and `b` may be given in either order. */
export function isBetween(d: Date, a: Date, b: Date): boolean {
  const [from, to] = compareDays(a, b) <= 0 ? [a, b] : [b, a];
  return compareDays(d, from) >= 0 && compareDays(d, to) <= 0;
}

export function startOfWeek(d: Date, weekStartsOn: WeekStart = 1): Date {
  return addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
}

export function endOfWeek(d: Date, weekStartsOn: WeekStart = 1): Date {
  return addDays(startOfWeek(d, weekStartsOn), 6);
}

/** Pull `d` into [min, max] (either may be omitted). */
export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBefore(d, min)) return startOfDay(min);
  if (max && isAfter(d, max)) return startOfDay(max);
  return d;
}

/** The weeks shown for a month: Date[7][] — 6 rows by default so the height never jumps. */
export function getMonthWeeks(month: Date, weekStartsOn: WeekStart = 1, fixedWeeks = true): Date[][] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  const last = endOfWeek(endOfMonth(month), weekStartsOn);
  const rows = fixedWeeks ? 6 : Math.round((last.getTime() - first.getTime()) / 604_800_000);
  const weeks: Date[][] = [];
  for (let w = 0; w < rows; w++) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i)));
  }
  return weeks;
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/** 'YYYY-MM-DD' in local time — a stable key, never `toISOString()` (that is UTC). */
export const dateKey = (d: Date): string => `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const monthKey = (d: Date): string => `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}`;

/** Inverse of dateKey. Returns null for anything that is not a real date. */
export function parseDateKey(key: string | undefined | null): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key ?? '');
  if (!m) return null;
  const [y, mo, da] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(y, mo - 1, da);
  return d.getFullYear() === y && d.getMonth() === mo - 1 && d.getDate() === da ? d : null;
}

/** True when `d` matches a disabled-dates list or predicate. */
export function matchesDate(d: Date, matcher?: DateMatcher): boolean {
  if (!matcher) return false;
  return typeof matcher === 'function' ? matcher(d) : matcher.some((m) => isSameDay(m, d));
}

export interface WeekdayLabel {
  /** 'Monday' */
  long: string;
  /** 'Mon' */
  short: string;
}

/** Weekday names from Intl, starting at `weekStartsOn`. */
export function getWeekdayLabels(locale: string | undefined, weekStartsOn: WeekStart = 1): WeekdayLabel[] {
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 1 Jan 2023 was a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2023, 0, 1 + ((weekStartsOn + i) % 7));
    return { long: long.format(d), short: short.format(d) };
  });
}

export const formatMonthYear = (d: Date, locale?: string): string =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d);

export const formatFullDate = (d: Date, locale?: string): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(d);
