import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  dateKey,
  endOfWeek,
  getDaysInMonth,
  getMonthWeeks,
  getWeekdayLabels,
  isBetween,
  isSameDay,
  matchesDate,
  parseDateKey,
  startOfDay,
  startOfWeek,
} from './date-utils';
import { firstSelectedDate, nextRange, toggleDate } from './selection';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('date-utils', () => {
  it('adds days across month, year and DST boundaries without drifting', () => {
    expect(dateKey(addDays(d(2026, 1, 31), 1))).toBe('2026-02-01');
    expect(dateKey(addDays(d(2026, 12, 31), 1))).toBe('2027-01-01');
    expect(dateKey(addDays(d(2026, 3, 28), 2))).toBe('2026-03-30'); // EU DST change weekend
    expect(dateKey(addDays(d(2026, 10, 31), 1))).toBe('2026-11-01'); // US DST change weekend
    expect(addDays(d(2026, 6, 15), 3).getHours()).toBe(0);
  });

  it('adds months by clamping the day', () => {
    expect(dateKey(addMonths(d(2026, 1, 31), 1))).toBe('2026-02-28');
    expect(dateKey(addMonths(d(2028, 1, 31), 1))).toBe('2028-02-29');
    expect(dateKey(addMonths(d(2026, 11, 15), 2))).toBe('2027-01-15');
    expect(dateKey(addMonths(d(2026, 1, 15), -2))).toBe('2025-11-15');
    expect(dateKey(addYears(d(2028, 2, 29), 1))).toBe('2029-02-28');
  });

  it('compares by day, ignoring the time of day', () => {
    expect(isSameDay(new Date(2026, 5, 1, 0, 0), new Date(2026, 5, 1, 23, 59))).toBe(true);
    expect(compareDays(d(2026, 5, 31), d(2026, 6, 1))).toBeLessThan(0);
    expect(isBetween(d(2026, 5, 10), d(2026, 5, 12), d(2026, 5, 1))).toBe(true);
    expect(isBetween(d(2026, 5, 13), d(2026, 5, 12), d(2026, 5, 1))).toBe(false);
    expect(startOfDay(new Date(2026, 5, 1, 17, 30)).getHours()).toBe(0);
  });

  it('finds week boundaries for any first weekday', () => {
    const wed = d(2026, 11, 25); // Wednesday
    expect(dateKey(startOfWeek(wed, 1))).toBe('2026-11-23');
    expect(dateKey(startOfWeek(wed, 0))).toBe('2026-11-22');
    expect(dateKey(endOfWeek(wed, 1))).toBe('2026-11-29');
    expect(dateKey(startOfWeek(d(2026, 11, 23), 1))).toBe('2026-11-23');
  });

  it('builds a 6-row grid starting on the chosen weekday', () => {
    const weeks = getMonthWeeks(d(2026, 11, 1), 1);
    expect(weeks).toHaveLength(6);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(dateKey(weeks[0]![0]!)).toBe('2026-10-26');
    expect(dateKey(weeks[5]![6]!)).toBe('2026-12-06');
    expect(getMonthWeeks(d(2026, 2, 1), 1, false)).toHaveLength(5);
    expect(getDaysInMonth(d(2028, 2, 1))).toBe(29);
  });

  it('round-trips date keys and rejects invalid ones', () => {
    expect(dateKey(parseDateKey('2026-02-03')!)).toBe('2026-02-03');
    expect(parseDateKey('2026-02-30')).toBeNull();
    expect(parseDateKey('nope')).toBeNull();
    expect(parseDateKey(undefined)).toBeNull();
  });

  it('matches disabled dates from a list or a predicate', () => {
    expect(matchesDate(d(2026, 5, 1), [d(2026, 5, 1)])).toBe(true);
    expect(matchesDate(d(2026, 5, 2), [d(2026, 5, 1)])).toBe(false);
    expect(matchesDate(d(2026, 5, 2), (x) => x.getDay() === 6)).toBe(true);
    expect(matchesDate(d(2026, 5, 2))).toBe(false);
  });

  it('clamps into min and max', () => {
    expect(dateKey(clampDate(d(2026, 1, 1), d(2026, 3, 1), d(2026, 4, 1)))).toBe('2026-03-01');
    expect(dateKey(clampDate(d(2026, 6, 1), d(2026, 3, 1), d(2026, 4, 1)))).toBe('2026-04-01');
    expect(dateKey(clampDate(d(2026, 3, 15), d(2026, 3, 1), d(2026, 4, 1)))).toBe('2026-03-15');
  });

  it('lists weekday labels from Intl starting at the chosen day', () => {
    const mon = getWeekdayLabels('en-US', 1);
    expect(mon.map((w) => w.short)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(mon[0]!.long).toBe('Monday');
    expect(getWeekdayLabels('en-US', 0)[0]!.short).toBe('Sun');
  });
});

describe('selection', () => {
  it('toggles multiple dates', () => {
    const one = toggleDate([], d(2026, 5, 1));
    expect(one).toHaveLength(1);
    expect(toggleDate(one, d(2026, 5, 1))).toHaveLength(0);
  });

  it('builds a range in either direction and restarts on a third pick', () => {
    const start = nextRange({ from: null, to: null }, d(2026, 5, 10));
    expect(start.to).toBeNull();
    const done = nextRange(start, d(2026, 5, 4));
    expect(dateKey(done.from!)).toBe('2026-05-04');
    expect(dateKey(done.to!)).toBe('2026-05-10');
    const again = nextRange(done, d(2026, 6, 1));
    expect(dateKey(again.from!)).toBe('2026-06-01');
    expect(again.to).toBeNull();
  });

  it('finds the first selected date', () => {
    expect(firstSelectedDate(null)).toBeNull();
    expect(firstSelectedDate([d(2026, 5, 2)])).toEqual(d(2026, 5, 2));
    expect(firstSelectedDate({ from: d(2026, 5, 3), to: null })).toEqual(d(2026, 5, 3));
  });
});
