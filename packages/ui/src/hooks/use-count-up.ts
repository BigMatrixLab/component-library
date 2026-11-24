'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  /** Final value. Changing it later tweens from the current value. */
  end: number;
  /** Where the count starts. Default 0. */
  start?: number;
  /** Tween length in ms. Default 1400. */
  duration?: number;
  /** Wait before starting, in ms. Default 0. */
  delay?: number;
  /** Fraction of the element that must be visible to start. Default 0.4. */
  threshold?: number;
  /** Count once, the first time it scrolls into view. When false it resets and replays on every entry. Default true. */
  once?: boolean;
  /** Skip the animation and return `end`. */
  disabled?: boolean;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Count from `start` to `end` when the element scrolls into view.
 * Attach `ref` to the element that shows the number; `value` is a float, so format it
 * (e.g. with Intl.NumberFormat and tabular-nums). Reduced motion jumps straight to `end`.
 *   const { ref, value } = useCountUp<HTMLSpanElement>({ end: 12480 });
 */
export function useCountUp<T extends Element = HTMLElement>({
  end,
  start = 0,
  duration = 1400,
  delay = 0,
  threshold = 0.4,
  once = true,
  disabled = false,
}: UseCountUpOptions) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [value, setValue] = useState(disabled ? end : start);
  const current = useRef(disabled ? end : start);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled, once, threshold]);

  useEffect(() => {
    if (disabled) {
      current.current = end;
      setValue(end);
      return;
    }
    if (!inView) {
      if (!once) {
        current.current = start;
        setValue(start);
      }
      return;
    }
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || duration <= 0) {
      current.current = end;
      setValue(end);
      return;
    }
    const from = current.current;
    let frame = 0;
    let began: number | null = null;
    const tick = (now: number) => {
      if (began === null) began = now;
      const t = Math.min(1, (now - began) / duration);
      const next = from + (end - from) * easeOutExpo(t);
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [disabled, inView, end, start, duration, delay, once]);

  return { ref, value, inView };
}
