import { startOfDay } from '../calendar/date-utils';
import type { DateRange } from '../calendar/selection';

/** Default display format: "Nov 24, 2026". */
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

/** Format a date with Intl. `format` takes any Intl.DateTimeFormat options. */
export function formatPickerDate(date: Date, locale = 'en-US', format: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT): string {
  return new Intl.DateTimeFormat(locale, format).format(date);
}

/**
 * Format a range: "Nov 3 – Nov 24, 2026". Inside one year the first date drops
 * the year; across years both keep it. A range with only a start shows "Nov 3 –".
 */
export function formatPickerDateRange(
  range: DateRange | null | undefined,
  locale = 'en-US',
  format: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT,
): string {
  if (!range?.from) return '';
  if (!range.to) return `${formatPickerDate(range.from, locale, format)} –`;
  const { from, to } = range;
  if (format.year && !format.dateStyle && from.getFullYear() === to.getFullYear()) {
    const withoutYear: Intl.DateTimeFormatOptions = { ...format };
    delete withoutYear.year;
    return `${formatPickerDate(from, locale, withoutYear)} – ${formatPickerDate(to, locale, format)}`;
  }
  return `${formatPickerDate(from, locale, format)} – ${formatPickerDate(to, locale, format)}`;
}

type Part = 'd' | 'm' | 'y';

/** The order a locale writes day, month and year in, e.g. ['m','d','y'] for en-US. */
export function getDateOrder(locale = 'en-US'): Part[] {
  const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(
    new Date(2000, 10, 25),
  );
  const order: Part[] = [];
  for (const p of parts) {
    if (p.type === 'day') order.push('d');
    else if (p.type === 'month') order.push('m');
    else if (p.type === 'year') order.push('y');
  }
  return order.length === 3 ? order : ['m', 'd', 'y'];
}

/** A real calendar date from parts, or null when it would roll over (31 Feb) or the year is absurd. */
function makeDate(y: number, m: number, d: number): Date | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || y < 1 || y > 9999) return null;
  const date = new Date(2000, 0, 1);
  date.setFullYear(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

const fullYear = (raw: string): number => (raw.length <= 2 ? 2000 + Number(raw) : Number(raw));

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ.]/g, '');

function monthLookup(locale: string): Map<string, number> {
  const map = new Map<string, number>();
  const locales = locale === 'en-US' ? [locale] : [locale, 'en-US'];
  for (const loc of locales) {
    for (const style of ['long', 'short'] as const) {
      const fmt = new Intl.DateTimeFormat(loc, { month: style });
      for (let i = 0; i < 12; i++) {
        const name = normalise(fmt.format(new Date(2000, i, 1)));
        if (!map.has(name)) map.set(name, i + 1);
        // "sept" for "september"
        if (style === 'long' && name.length > 4 && !map.has(name.slice(0, 4))) map.set(name.slice(0, 4), i + 1);
      }
    }
  }
  return map;
}

/**
 * Parse what a person types into a date, or null when it is not a real date.
 * Accepts ISO (2026-11-24), numeric in the locale's order (11/24/2026, 24.11.2026,
 * 24-11-26) and month names (Nov 24 2026, 24 November 2026, Nov 24, 26).
 * A missing year means the current year. Two-digit years mean 20xx.
 */
export function parsePickerDate(input: string, locale = 'en-US', today: Date = new Date()): Date | null {
  const text = input.trim();
  if (!text) return null;
  const currentYear = startOfDay(today).getFullYear();

  // ISO-like: year first with four digits
  const iso = /^(\d{4})[-/.\s](\d{1,2})[-/.\s](\d{1,2})$/.exec(text);
  if (iso) return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  // Month name anywhere: "Nov 24, 2026" / "24 November 2026"
  const tokens = text.split(/[\s,./-]+/).filter(Boolean);
  const months = monthLookup(locale);
  const nameIndex = tokens.findIndex((t) => /\D/.test(t) && months.has(normalise(t)));
  if (nameIndex !== -1) {
    const month = months.get(normalise(tokens[nameIndex]!))!;
    const numbers = tokens.filter((_, i) => i !== nameIndex);
    if (numbers.length < 1 || numbers.length > 2 || numbers.some((n) => !/^\d{1,4}$/.test(n))) return null;
    const yearToken = numbers.find((n) => n.length === 4);
    const rest = numbers.filter((n) => n !== yearToken);
    if (yearToken && rest.length === 1) return makeDate(Number(yearToken), month, Number(rest[0]));
    if (!yearToken && rest.length === 1) return makeDate(currentYear, month, Number(rest[0]));
    if (!yearToken && rest.length === 2) return makeDate(fullYear(rest[1]!), month, Number(rest[0]));
    return null;
  }

  // Numeric: three groups split by / . - or spaces, in the locale's order
  const nums = /^(\d{1,4})[-/.\s]+(\d{1,2})[-/.\s]+(\d{1,4})$/.exec(text);
  if (nums) {
    const raw = [nums[1]!, nums[2]!, nums[3]!];
    const order = getDateOrder(locale);
    const values: Record<Part, string> = { d: '', m: '', y: '' };
    // The four-digit group is the year wherever it sits; the others follow the locale order
    const yearAt = raw.findIndex((r) => r.length === 4);
    if (yearAt !== -1) {
      values.y = raw[yearAt]!;
      const others = order.filter((p) => p !== 'y');
      const left = raw.filter((_, i) => i !== yearAt);
      values[others[0]!] = left[0]!;
      values[others[1]!] = left[1]!;
    } else {
      order.forEach((p, i) => {
        values[p] = raw[i]!;
      });
    }
    return makeDate(fullYear(values.y), Number(values.m), Number(values.d));
  }

  // Day and month only: "24/11" in the locale's order, current year
  const short = /^(\d{1,2})[-/.]+(\d{1,2})$/.exec(text);
  if (short) {
    const order = getDateOrder(locale).filter((p) => p !== 'y');
    const values: Record<string, string> = {};
    order.forEach((p, i) => {
      values[p] = [short[1]!, short[2]!][i]!;
    });
    return makeDate(currentYear, Number(values.m), Number(values.d));
  }
  return null;
}
