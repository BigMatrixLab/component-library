import { prefersReducedMotion } from './dom';

export type SpringName = 'snappy' | 'smooth' | 'morph';

export interface SpringTiming {
  /** A CSS `linear(...)` curve (or a cubic-bezier fallback). */
  easing: string;
  /** Milliseconds. */
  duration: number;
}

const FALLBACK: SpringTiming = { easing: 'cubic-bezier(0.22, 1, 0.36, 1)', duration: 420 };

/**
 * Read a spring preset (`--ui-spring-<name>` + `-duration`) from CSS so that
 * Web Animations API animations use exactly the same curve as CSS transitions.
 * WAAPI cannot resolve `var()` in `easing`, hence the computed-style read.
 */
export function readSpring(name: SpringName, el?: Element | null): SpringTiming {
  if (typeof document === 'undefined') return FALLBACK;
  const style = getComputedStyle(el ?? document.documentElement);
  const easing = style.getPropertyValue(`--ui-spring-${name}`).trim();
  const raw = style.getPropertyValue(`--ui-spring-${name}-duration`).trim();
  let duration = parseFloat(raw);
  if (raw.endsWith('ms')) duration = parseFloat(raw);
  else if (raw.endsWith('s')) duration = parseFloat(raw) * 1000;
  return {
    easing: easing || FALLBACK.easing,
    duration: Number.isFinite(duration) && duration > 0 ? duration : FALLBACK.duration,
  };
}

/**
 * `el.animate()` that never throws: a browser without `linear()` support
 * rejects the easing, so retry with a plain ease-out. Returns null when
 * the Web Animations API is missing.
 */
export function animateSafe(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
): Animation | null {
  if (typeof el.animate !== 'function') return null;
  try {
    return el.animate(keyframes, options);
  } catch {
    try {
      return el.animate(keyframes, { ...options, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    } catch {
      return null;
    }
  }
}

export { prefersReducedMotion };
