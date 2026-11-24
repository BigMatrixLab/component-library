import { dateKey } from '../calendar/date-utils';
import { getDateOrder, formatPickerDate, formatPickerDateRange, parsePickerDate } from './date-input';
import { defaultDateRangePresets } from './date-range-presets';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const key = (date: Date | null) => (date ? dateKey(date) : null);
const TODAY = d(2026, 11, 24);

describe('parsePickerDate', () => {
  it('parses ISO dates', () => {
    expect(key(parsePickerDate('2026-11-24'))).toBe('2026-11-24');
    expect(key(parsePickerDate('2026/1/5'))).toBe('2026-01-05');
  });

  it('reads numeric dates in the locale order', () => {
    expect(key(parsePickerDate('11/24/2026', 'en-US'))).toBe('2026-11-24');
    expect(key(parsePickerDate('24/11/2026', 'en-GB'))).toBe('2026-11-24');
    expect(key(parsePickerDate('24.11.2026', 'de-DE'))).toBe('2026-11-24');
    expect(key(parsePickerDate('3/4/2026', 'en-US'))).toBe('2026-03-04');
    expect(key(parsePickerDate('3/4/2026', 'en-GB'))).toBe('2026-04-03');
  });

  it('expands two-digit years to 20xx', () => {
    expect(key(parsePickerDate('11/24/26', 'en-US'))).toBe('2026-11-24');
  });

  it('parses month names in either position, with or without a year', () => {
    expect(key(parsePickerDate('Nov 24, 2026'))).toBe('2026-11-24');
    expect(key(parsePickerDate('24 November 2026'))).toBe('2026-11-24');
    expect(key(parsePickerDate('november 3 2026'))).toBe('2026-11-03');
    expect(key(parsePickerDate('Dec 5', 'en-US', TODAY))).toBe('2026-12-05');
    expect(key(parsePickerDate('Sept 9 2026'))).toBe('2026-09-09');
  });

  it('rejects things that are not real dates', () => {
    expect(parsePickerDate('')).toBeNull();
    expect(parsePickerDate('hello')).toBeNull();
    expect(parsePickerDate('2026-02-30')).toBeNull();
    expect(parsePickerDate('13/45/2026', 'en-US')).toBeNull();
    expect(parsePickerDate('Foo 12 2026')).toBeNull();
    expect(parsePickerDate('Nov 31 2026')).toBeNull();
  });

  it('knows the day/month/year order of a locale', () => {
    expect(getDateOrder('en-US')).toEqual(['m', 'd', 'y']);
    expect(getDateOrder('en-GB')).toEqual(['d', 'm', 'y']);
  });
});

describe('formatting', () => {
  it('formats a date and a range', () => {
    expect(formatPickerDate(d(2026, 11, 24), 'en-US')).toBe('Nov 24, 2026');
    expect(formatPickerDateRange({ from: d(2026, 11, 3), to: d(2026, 11, 24) }, 'en-US')).toBe('Nov 3 – Nov 24, 2026');
    expect(formatPickerDateRange({ from: d(2026, 12, 20), to: d(2027, 1, 4) }, 'en-US')).toBe('Dec 20, 2026 – Jan 4, 2027');
    expect(formatPickerDateRange({ from: d(2026, 11, 3), to: null }, 'en-US')).toBe('Nov 3, 2026 –');
    expect(formatPickerDateRange({ from: null, to: null })).toBe('');
  });
});

describe('defaultDateRangePresets', () => {
  const byLabel = (label: string) => defaultDateRangePresets.find((p) => p.label === label)!.range(TODAY);

  it('computes the standard ranges from today', () => {
    expect(byLabel('Today')).toEqual({ from: TODAY, to: TODAY });
    expect(key(byLabel('Yesterday').from)).toBe('2026-11-23');
    expect(key(byLabel('Last 7 days').from)).toBe('2026-11-18');
    expect(key(byLabel('Last 30 days').from)).toBe('2026-10-26');
    expect([key(byLabel('This month').from), key(byLabel('This month').to)]).toEqual(['2026-11-01', '2026-11-30']);
    expect([key(byLabel('Last month').from), key(byLabel('Last month').to)]).toEqual(['2026-10-01', '2026-10-31']);
    expect([key(byLabel('This year').from), key(byLabel('This year').to)]).toEqual(['2026-01-01', '2026-12-31']);
  });
});
