import { bandScale, linearScale, niceScale, niceStep, stackSeries, toNumber } from './scale';

describe('niceStep', () => {
  it('picks 1, 2 or 5 times a power of ten at or above the raw step', () => {
    expect(niceStep(0.9)).toBe(1);
    expect(niceStep(1.3)).toBe(2);
    expect(niceStep(2.1)).toBe(5);
    expect(niceStep(5.5)).toBe(10);
    expect(niceStep(34)).toBe(50);
    expect(niceStep(0.07)).toBeCloseTo(0.1);
    expect(niceStep(0)).toBe(1);
  });
});

describe('niceScale', () => {
  it('extends the domain to round ticks', () => {
    const s = niceScale(3, 97, 5);
    expect(s.min).toBe(0);
    expect(s.max).toBe(100);
    expect(s.ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });
  it('handles negatives and crossing zero', () => {
    const s = niceScale(-42, 130, 4);
    expect(s.ticks[0]).toBeLessThanOrEqual(-42);
    expect(s.ticks.at(-1)).toBeGreaterThanOrEqual(130);
    expect(s.ticks).toContain(0);
  });
  it('avoids floating point noise for fractional steps', () => {
    expect(niceScale(0, 0.7, 7).ticks).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
  });
  it('copes with a flat or empty domain', () => {
    expect(niceScale(5, 5).ticks.length).toBeGreaterThan(1);
    expect(niceScale(0, 0).max).toBeGreaterThan(0);
    expect(niceScale(NaN, 3).ticks.length).toBeGreaterThan(1);
  });
});

describe('linearScale', () => {
  it('maps and inverts', () => {
    const s = linearScale([0, 100], [200, 0]);
    expect(s(25)).toBe(150);
    expect(s.invert(150)).toBe(25);
  });
});

describe('bandScale', () => {
  it('centres bands in the range and finds the band under a pixel', () => {
    const b = bandScale(4, [0, 400], { paddingInner: 0.2, paddingOuter: 0.1 });
    expect(b.bandwidth).toBeCloseTo(b.step * 0.8);
    expect(b(0) + b.bandwidth / 2).toBeLessThan(b(1) + b.bandwidth / 2);
    expect(b.indexAt(b(2) + b.bandwidth / 2)).toBe(2);
    expect(b.indexAt(-50)).toBe(0);
    expect(b.indexAt(9999)).toBe(3);
  });
});

describe('stackSeries', () => {
  it('stacks positives up and negatives down', () => {
    const out = stackSeries([{ a: 3, b: 2, c: -4 }, { a: 1, b: -1, c: -2 }], ['a', 'b', 'c']);
    expect(out[0][0]).toEqual({ lo: 0, hi: 3 });
    expect(out[1][0]).toEqual({ lo: 3, hi: 5 });
    expect(out[2][0]).toEqual({ lo: -4, hi: 0 });
    expect(out[1][1]).toEqual({ lo: -1, hi: 0 });
    expect(out[2][1]).toEqual({ lo: -3, hi: -1 });
  });
});

describe('toNumber', () => {
  it('accepts finite numbers and numeric strings only', () => {
    expect(toNumber(4)).toBe(4);
    expect(toNumber('4.5')).toBe(4.5);
    expect(toNumber('')).toBeNull();
    expect(toNumber(NaN)).toBeNull();
    expect(toNumber(null)).toBeNull();
  });
});
