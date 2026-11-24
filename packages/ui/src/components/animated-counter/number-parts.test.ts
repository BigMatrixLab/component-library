import { describe, expect, it } from 'vitest';
import { buildNumberCells, localizedDigits, numberText } from './number-parts';

const digits = localizedDigits('en-US');
const cellsFor = (value: number, options?: Intl.NumberFormatOptions) =>
  buildNumberCells(new Intl.NumberFormat('en-US', options).formatToParts(value), digits);

describe('localizedDigits', () => {
  it('returns the ten digits', () => {
    expect(digits).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });
});

describe('buildNumberCells', () => {
  it('keeps currency, separators and decimals as symbols and digits as reels', () => {
    const cells = cellsFor(1234.5, { style: 'currency', currency: 'USD' });
    expect(cells.map((c) => c.key)).toEqual([
      'currency-0',
      'int-3',
      'group-2',
      'int-2',
      'int-1',
      'int-0',
      'decimal-0',
      'frac-0',
      'frac-1',
    ]);
    const digitValues = cells.filter((c) => c.kind === 'digit').map((c) => (c.kind === 'digit' ? c.digit : -1));
    expect(digitValues).toEqual([1, 2, 3, 4, 5, 0]);
  });

  it('keeps digit identity by place value when the number grows', () => {
    const before = cellsFor(999).map((c) => c.key);
    const after = cellsFor(1000).map((c) => c.key);
    expect(before).toEqual(['int-2', 'int-1', 'int-0']);
    expect(after).toEqual(['int-3', 'group-2', 'int-2', 'int-1', 'int-0']);
    // every old digit still exists, so only the new ones mount
    for (const key of before) expect(after).toContain(key);
  });

  it('handles negatives, percent and compact notation', () => {
    expect(cellsFor(-0.256, { style: 'percent' }).map((c) => c.key)).toEqual(['minusSign-0', 'int-1', 'int-0', 'percentSign-0']);
    const compact = cellsFor(1200, { notation: 'compact' });
    expect(compact[compact.length - 1]).toMatchObject({ kind: 'symbol', type: 'compact', text: 'K' });
  });
});

describe('numberText', () => {
  it('joins the formatted parts', () => {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).formatToParts(1234.5);
    expect(numberText(parts)).toBe('$1,234.50');
  });
});
