/** Scales, "nice" ticks and stacking. Pure functions, no DOM. */

export interface LinearScale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
  invert(px: number): number;
}

export function linearScale(domain: [number, number], range: [number, number]): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const fn = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as LinearScale;
  fn.domain = domain;
  fn.range = range;
  fn.invert = (px) => d0 + ((px - r0) / (r1 - r0 || 1)) * span;
  return fn;
}

export interface BandScale {
  (index: number): number;
  bandwidth: number;
  step: number;
  count: number;
  /** The band whose slot (band plus half the padding each side) contains `px`. */
  indexAt(px: number): number;
}

export function bandScale(
  count: number,
  range: [number, number],
  { paddingInner = 0.2, paddingOuter = 0.1 }: { paddingInner?: number; paddingOuter?: number } = {},
): BandScale {
  const [r0, r1] = range;
  const n = Math.max(count, 1);
  const step = (r1 - r0) / Math.max(n - paddingInner + 2 * paddingOuter, 1e-6);
  const bandwidth = step * (1 - paddingInner);
  const start = r0 + (r1 - r0 - step * (n - paddingInner)) / 2;
  const fn = ((i: number) => start + step * i) as BandScale;
  fn.bandwidth = bandwidth;
  fn.step = step;
  fn.count = count;
  fn.indexAt = (px) => {
    const i = Math.floor((px - (start - (step - bandwidth) / 2)) / step);
    return Math.min(Math.max(i, 0), Math.max(count - 1, 0));
  };
  return fn;
}

/** The nearest "nice" step (1, 2, 5 x 10^n) at or above `raw`. */
export function niceStep(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

export interface NiceScale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

/** Extend [min, max] to round numbers and list the ticks between (about `count`). */
export function niceScale(min: number, max: number, count = 5): NiceScale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min > max) [min, max] = [max, min];
  if (min === max) {
    if (min === 0) max = 1;
    else {
      const pad = Math.abs(min) * 0.1;
      min -= pad;
      max += pad;
    }
  }
  const step = niceStep((max - min) / Math.max(1, count));
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const digits = Math.min(12, Math.max(0, -Math.floor(Math.log10(step))) + 2);
  const total = Math.round((hi - lo) / step);
  const ticks: number[] = [];
  for (let i = 0; i <= total; i++) ticks.push(Number((lo + i * step).toFixed(digits)));
  return { min: ticks[0]!, max: ticks[ticks.length - 1]!, step, ticks };
}

/** A finite number from a number or numeric string; otherwise null. */
export function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export interface StackBand {
  lo: number;
  hi: number;
}

/**
 * Stack series on top of each other. Positive values stack up from 0, negative
 * values stack down from 0, so mixed-sign data never overlaps.
 */
export function stackSeries(data: Record<string, unknown>[], keys: string[]): StackBand[][] {
  const out: StackBand[][] = keys.map(() => []);
  data.forEach((row) => {
    let pos = 0;
    let neg = 0;
    keys.forEach((key, k) => {
      const v = toNumber(row[key]) ?? 0;
      if (v >= 0) {
        out[k]!.push({ lo: pos, hi: pos + v });
        pos += v;
      } else {
        out[k]!.push({ lo: neg + v, hi: neg });
        neg += v;
      }
    });
  });
  return out;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
