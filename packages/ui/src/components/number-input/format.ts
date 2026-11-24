export type NumberStyle = 'number' | 'currency' | 'percent';

const INTL_STYLE: Record<NumberStyle, Intl.NumberFormatOptions['style']> = {
  number: 'decimal',
  currency: 'currency',
  percent: 'percent',
};

export interface NumberFormatConfig {
  style?: NumberStyle;
  /** BCP 47 tag such as "en-US" or "de-DE". Default: the runtime locale. */
  locale?: string;
  /** ISO 4217 code for `style: 'currency'`, e.g. "EUR". Default "USD". */
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** How many digits follow the decimal point of `n` (handles exponent notation). */
export function countDecimals(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  if (s.includes('e-')) {
    const [mantissa = '', exp] = s.split('e-');
    return (mantissa.split('.')[1]?.length ?? 0) + Number(exp);
  }
  return s.split('.')[1]?.length ?? 0;
}

/** Round to `decimals` places, removing floating-point noise (0.1 + 0.2 becomes 0.3). */
export function roundTo(n: number, decimals: number): number {
  return Number(n.toFixed(Math.min(Math.max(decimals, 0), 20)));
}

export function clampNumber(n: number, min?: number, max?: number): number {
  let out = n;
  if (max !== undefined && out > max) out = max;
  if (min !== undefined && out < min) out = min;
  return out;
}

/**
 * An Intl.NumberFormat that shows at least as many decimals as the step needs.
 * `precision` is the number of decimals of the step (in the value's own units).
 */
export function createFormatter(config: NumberFormatConfig = {}, precision = 0): Intl.NumberFormat {
  const style = config.style ?? 'number';
  const intlStyle = INTL_STYLE[style];
  const options: Intl.NumberFormatOptions = { style: intlStyle };
  if (style === 'currency') options.currency = config.currency ?? 'USD';

  const min = config.minimumFractionDigits;
  let max = config.maximumFractionDigits;
  if (max === undefined) {
    if (style === 'number') max = Math.max(3, precision, min ?? 0);
    else if (style === 'percent') max = Math.max(0, precision - 2, min ?? 0);
    else if (precision > 2 || (min !== undefined && min > 2)) max = Math.max(precision, min ?? 0);
  }
  if (min !== undefined) options.minimumFractionDigits = min;
  if (max !== undefined) options.maximumFractionDigits = min !== undefined ? Math.max(max, min) : max;

  try {
    return new Intl.NumberFormat(config.locale, options);
  } catch {
    try {
      return new Intl.NumberFormat(config.locale, { style: intlStyle, currency: options.currency });
    } catch {
      return new Intl.NumberFormat();
    }
  }
}

export function formatNumber(value: number | null | undefined, formatter: Intl.NumberFormat): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';
  return formatter.format(value);
}

interface Symbols {
  decimal: string;
  group: string;
  minus: string;
  digits: Record<string, string>;
}

const symbolCache = new Map<string, Symbols>();

function getSymbols(locale: string | undefined): Symbols {
  const key = locale ?? '';
  const cached = symbolCache.get(key);
  if (cached) return cached;
  let decimal = '.';
  let group = ',';
  let minus = '-';
  const digits: Record<string, string> = {};
  try {
    const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).formatToParts(-12345.6);
    decimal = parts.find((p) => p.type === 'decimal')?.value ?? decimal;
    group = parts.find((p) => p.type === 'group')?.value ?? group;
    minus = parts.find((p) => p.type === 'minusSign')?.value ?? minus;
    const numerals = new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210);
    // Locales with their own numerals (Arabic-Indic, Devanagari…): map them to 0-9
    Array.from(numerals)
      .reverse()
      .forEach((ch, i) => {
        digits[ch] = String(i);
      });
  } catch {
    /* fall back to en-US symbols */
  }
  const symbols = { decimal, group, minus, digits };
  symbolCache.set(key, symbols);
  return symbols;
}

/**
 * Parse text typed by a person in `config.locale` back to a number.
 * Ignores currency symbols, group separators and "%". Returns null when there
 * is nothing numeric in the text. For `percent`, "25" and "25%" both give 0.25.
 */
export function parseNumber(text: string, config: Pick<NumberFormatConfig, 'style' | 'locale'> = {}): number | null {
  const raw = text.trim();
  if (!raw) return null;
  const sym = getSymbols(config.locale);

  const negative = /^[-−‒-―]/.test(raw) || raw.startsWith(sym.minus) || /^\(.*\)$/.test(raw);

  let s = '';
  for (const ch of Array.from(raw)) s += sym.digits[ch] ?? ch;

  // Be lenient: a "." or "," that is not the locale's group separator is a decimal point
  let dec = sym.decimal;
  if (!s.includes(dec)) {
    if (s.includes('.') && sym.group !== '.') dec = '.';
    else if (s.includes(',') && sym.group !== ',') dec = ',';
  }

  let cleaned = '';
  for (const ch of Array.from(s)) {
    if (ch >= '0' && ch <= '9') cleaned += ch;
    else if (ch === dec) cleaned += '.';
  }
  if (!/\d/.test(cleaned) || (cleaned.match(/\./g)?.length ?? 0) > 1) return null;

  let n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  if (negative) n = -n;
  if (config.style === 'percent') n = n / 100;
  return n;
}
