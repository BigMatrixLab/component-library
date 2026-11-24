import { clampNumber, countDecimals, createFormatter, formatNumber, parseNumber, roundTo } from './format';

describe('number-input format helpers', () => {
  it('counts decimals', () => {
    expect(countDecimals(1)).toBe(0);
    expect(countDecimals(0.25)).toBe(2);
    expect(countDecimals(1e-7)).toBe(7);
  });

  it('rounds away floating point noise', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(1.4, 0)).toBe(1);
  });

  it('clamps to optional bounds', () => {
    expect(clampNumber(5, 1, 3)).toBe(3);
    expect(clampNumber(-5, 0)).toBe(0);
    expect(clampNumber(7)).toBe(7);
  });

  it('formats numbers, currency and percent', () => {
    expect(formatNumber(1234.5, createFormatter({ locale: 'en-US' }))).toBe('1,234.5');
    expect(formatNumber(1249, createFormatter({ style: 'currency', currency: 'EUR', locale: 'en-IE' }))).toBe('€1,249.00');
    expect(formatNumber(0.15, createFormatter({ style: 'percent', locale: 'en-US' }))).toBe('15%');
    expect(formatNumber(null, createFormatter())).toBe('');
  });

  it('shows the decimals a fine step needs', () => {
    expect(formatNumber(0.125, createFormatter({ style: 'percent', locale: 'en-US' }, 3))).toBe('12.5%');
  });

  it('parses en-US text', () => {
    expect(parseNumber('1,234.5', { locale: 'en-US' })).toBe(1234.5);
    expect(parseNumber('-7', { locale: 'en-US' })).toBe(-7);
    expect(parseNumber('€1,249.00', { locale: 'en-US', style: 'currency' })).toBe(1249);
    expect(parseNumber('abc', { locale: 'en-US' })).toBeNull();
    expect(parseNumber('  ', { locale: 'en-US' })).toBeNull();
    expect(parseNumber('1.2.3', { locale: 'en-US' })).toBeNull();
  });

  it('parses percent as a fraction', () => {
    expect(parseNumber('25', { style: 'percent', locale: 'en-US' })).toBe(0.25);
    expect(parseNumber('25%', { style: 'percent', locale: 'en-US' })).toBe(0.25);
  });

  it('parses de-DE separators', () => {
    expect(parseNumber('1.234,5', { locale: 'de-DE' })).toBe(1234.5);
    expect(parseNumber('12,5', { locale: 'de-DE' })).toBe(12.5);
  });

  it('round-trips a formatted value', () => {
    const f = createFormatter({ style: 'currency', currency: 'EUR', locale: 'de-DE' });
    expect(parseNumber(formatNumber(1249.5, f), { style: 'currency', locale: 'de-DE' })).toBe(1249.5);
  });
});
