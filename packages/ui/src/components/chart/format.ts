/** Number formatting through Intl, cached (constructing Intl.NumberFormat is slow). */

export type ValueFormatOptions = Intl.NumberFormatOptions & { locale?: string };
export type ValueFormat = 'number' | 'currency' | 'percent' | 'compact' | ValueFormatOptions | ((value: number) => string);

const cache = new Map<string, Intl.NumberFormat>();

function intl(options: Intl.NumberFormatOptions, locale?: string): Intl.NumberFormat {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

const PRESETS: Record<string, Intl.NumberFormatOptions> = {
  number: { maximumFractionDigits: 2 },
  currency: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
  compact: { notation: 'compact', maximumFractionDigits: 1 },
};

/**
 * Full-precision formatter for tooltips and labels.
 * `'percent'` expects values already on a 0-100 scale (42 gives "42%"); pass
 * `{ style: 'percent' }` for fractions (0.42 gives "42%").
 */
export function createValueFormatter(format: ValueFormat = 'number', locale?: string): (value: number) => string {
  if (typeof format === 'function') return format;
  if (format === 'percent') {
    const f = intl({ maximumFractionDigits: 1 }, locale);
    return (v) => `${f.format(v)}%`;
  }
  if (typeof format === 'string') {
    const f = intl(PRESETS[format] ?? PRESETS.number!, locale);
    return (v) => f.format(v);
  }
  const { locale: own, ...options } = format;
  const f = intl(options, own ?? locale);
  return (v) => f.format(v);
}

/** Short formatter for axis ticks: compact notation unless the format says otherwise. */
export function createAxisFormatter(format: ValueFormat = 'number', locale?: string): (value: number) => string {
  if (typeof format === 'function') return format;
  if (format === 'percent') return createValueFormatter('percent', locale);
  if (format === 'number' || format === 'compact') return createValueFormatter('compact', locale);
  if (format === 'currency') {
    return createValueFormatter({ ...PRESETS.currency, notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 1 }, locale);
  }
  if (format.style === 'percent' || format.notation) return createValueFormatter(format, locale);
  return createValueFormatter({ ...format, notation: 'compact', maximumFractionDigits: format.maximumFractionDigits ?? 1 }, locale);
}
