import { compareDays, isSameDay } from './date-utils';

/** A date range. `to` is null while the user has only picked the start. */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export type CalendarSelection = Date | null | Date[] | DateRange;

export const emptyRange = (): DateRange => ({ from: null, to: null });

/** Order two dates so the earlier one comes first. */
export function orderDates(a: Date, b: Date): [Date, Date] {
  return compareDays(a, b) <= 0 ? [a, b] : [b, a];
}

/** Add `d` to the list, or remove it when it is already there. */
export function toggleDate(list: Date[], d: Date): Date[] {
  return list.some((x) => isSameDay(x, d)) ? list.filter((x) => !isSameDay(x, d)) : [...list, d];
}

/**
 * The range after the user picks `d`:
 * 1st pick sets the start, 2nd completes it (either direction), a 3rd starts over.
 */
export function nextRange(range: DateRange, d: Date): DateRange {
  if (range.from && !range.to) {
    const [from, to] = orderDates(range.from, d);
    return { from, to };
  }
  return { from: d, to: null };
}

/** First selected date of any selection shape (used to pick the initial month). */
export function firstSelectedDate(sel: CalendarSelection | undefined): Date | null {
  if (!sel) return null;
  if (sel instanceof Date) return sel;
  if (Array.isArray(sel)) return sel[0] ?? null;
  return sel.from;
}
