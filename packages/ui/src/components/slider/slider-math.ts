/** Pure value math for Slider — no DOM, so it is unit-tested directly. */

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Number of decimals in a number (handles `1e-7` notation). */
export function decimalCount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa = '', exponent] = String(n).split('e');
  const decimals = (mantissa.split('.')[1] ?? '').length;
  return Math.max(0, decimals - (exponent ? Number(exponent) : 0));
}

/** Snap to the nearest `min + k * step` inside [min, max], free of float noise (0.1 + 0.2). */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const clamped = clamp(value, min, max);
  const stepped = Math.round((clamped - min) / step) * step + min;
  const decimals = Math.max(decimalCount(step), decimalCount(min));
  return clamp(Number(stepped.toFixed(decimals)), min, max);
}

/** 0–1 position of a value on the track. */
export const valueToRatio = (value: number, min: number, max: number) =>
  max === min ? 0 : clamp((value - min) / (max - min), 0, 1);

/** Value (unsnapped) at a 0–1 position. */
export const ratioToValue = (ratio: number, min: number, max: number) => min + clamp(ratio, 0, 1) * (max - min);

/**
 * 0–1 position of a pointer along the track. The thumb centre travels only
 * `trackLength - thumbSize`, so the pointer is measured against that span.
 * `grabOffset` is how far from the thumb centre the pointer grabbed it.
 */
export function pointerToRatio({
  pointer,
  trackStart,
  trackLength,
  thumbSize,
  vertical = false,
  grabOffset = 0,
}: {
  pointer: number;
  trackStart: number;
  trackLength: number;
  thumbSize: number;
  vertical?: boolean;
  grabOffset?: number;
}): number {
  const span = trackLength - thumbSize;
  if (span <= 0) return 0;
  const along = (pointer - grabOffset - trackStart - thumbSize / 2) / span;
  return clamp(vertical ? 1 - along : along, 0, 1);
}

/** Index of the thumb closest to `value`; on a tie, the one that can move toward `value`. */
export function nearestThumb(values: number[], value: number): number {
  let best = 0;
  let bestDistance = Infinity;
  values.forEach((v, i) => {
    const distance = Math.abs(v - value);
    if (distance < bestDistance || (distance === bestDistance && value > v)) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

/** Return `values` with thumb `index` moved to `next`, kept between its neighbours and on the step grid. */
export function setThumbValue(
  values: number[],
  index: number,
  next: number,
  { min, max, step, minStepsBetweenThumbs = 0 }: { min: number; max: number; step: number; minStepsBetweenThumbs?: number },
): number[] {
  const gap = minStepsBetweenThumbs * step;
  const lower = index > 0 ? values[index - 1]! + gap : min;
  const upper = index < values.length - 1 ? values[index + 1]! - gap : max;
  const snapped = snapToStep(next, min, max, step);
  const bounded = clamp(snapped, Math.min(lower, upper), Math.max(lower, upper));
  if (bounded === values[index]) return values;
  const out = values.slice();
  out[index] = bounded;
  return out;
}

/** Keyboard value for a key, or `undefined` if the key does nothing. */
export function keyToValue(
  key: string,
  current: number,
  { min, max, step, lowerBound = min, upperBound = max }: { min: number; max: number; step: number; lowerBound?: number; upperBound?: number },
): number | undefined {
  const page = Math.max(step, Math.round((max - min) / step / 10) * step);
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return current + step;
    case 'ArrowLeft':
    case 'ArrowDown':
      return current - step;
    case 'PageUp':
      return current + page;
    case 'PageDown':
      return current - page;
    case 'Home':
      return lowerBound;
    case 'End':
      return upperBound;
    default:
      return undefined;
  }
}

export const sameValues = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
