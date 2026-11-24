'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { toNumber } from './scale';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const easeOut = (k: number) => 1 - (1 - k) ** 4;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Entrance motion, played once when the plot first mounts (the plot only mounts
 * on the client, after measuring, so there is no hydration flash). Marks opt in
 * with data attributes:
 *   data-draw   line: stroke draws in (dasharray from getTotalLength)
 *   data-fade   area: fades up
 *   data-grow   bar: grows from its baseline (data-axis x|y, data-origin css origin, data-order stagger index)
 * Everything is <= 700ms, ease-out, and skipped under prefers-reduced-motion.
 */
export function useEntrance(rootRef: RefObject<Element | null>, enabled: boolean) {
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || prefersReducedMotion() || typeof Element.prototype.animate !== 'function') return;
    const anims: Animation[] = [];

    root.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((el) => {
      const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
      if (!len) return;
      const delay = Math.min(Number(el.dataset.order ?? 0) * 40, 100);
      anims.push(
        el.animate(
          { strokeDasharray: [`${len} ${len}`, `${len} ${len}`], strokeDashoffset: [len, 0] },
          { duration: 600, delay, easing: EASE, fill: 'backwards' },
        ),
      );
    });

    root.querySelectorAll<SVGElement>('[data-fade]').forEach((el) => {
      const delay = Math.min(Number(el.dataset.order ?? 0) * 40, 100);
      anims.push(
        el.animate(
          { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
          { duration: 600, delay, easing: EASE, fill: 'backwards' },
        ),
      );
    });

    const bars = root.querySelectorAll<SVGElement>('[data-grow]');
    const stagger = Math.min(30, 200 / Math.max(bars.length, 1));
    bars.forEach((el, i) => {
      const x = el.dataset.axis === 'x';
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = el.dataset.origin ?? (x ? '0% 50%' : '50% 100%');
      anims.push(
        el.animate(
          { transform: [x ? 'scale(0, 1)' : 'scale(1, 0)', 'scale(1, 1)'] },
          { duration: 500, delay: i * stagger, easing: EASE, fill: 'backwards' },
        ),
      );
    });

    return () => anims.forEach((a) => a.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** 0 -> 1 on mount (ease-out, 700ms) for sweeps; 1 straight away when disabled or reduced motion. */
export function useSweep(enabled: boolean, duration = 700): number {
  const [p, setP] = useState(enabled ? 0 : 1);
  useIsomorphicLayoutEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setP(1);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      t0 = t0 || t;
      const k = Math.min(1, (t - t0) / duration);
      setP(easeOut(k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return p;
}

/** Smoothly move displayed numbers toward new targets. Snaps when the length changes. */
export function useTweenedNumbers(target: number[], enabled: boolean, duration = 450): number[] {
  const [value, setValue] = useState(target);
  const shown = useRef(target);
  const sig = target.join(',');

  useEffect(() => {
    if (!enabled) return;
    const from = shown.current;
    if (from.length === target.length && from.every((v, i) => Object.is(v, target[i]))) return;
    if (prefersReducedMotion() || from.length !== target.length) {
      shown.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      t0 = t0 || t;
      const k = easeOut(Math.min(1, (t - t0) / duration));
      const next = target.map((to, i) => (Number.isNaN(to) || Number.isNaN(from[i]) ? to : from[i]! + (to - from[i]!) * k));
      shown.current = next;
      setValue(next);
      if (t - t0 < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, enabled]);

  if (!enabled || value.length !== target.length) return target;
  return value;
}

/** `data` with the values of `keys` eased toward their latest numbers. Returns `data` itself when not animating. */
export function useTweenedData(data: Record<string, unknown>[], keys: string[], enabled: boolean): Record<string, unknown>[] {
  const flat = data.flatMap((row) => keys.map((k) => toNumber(row[k]) ?? Number.NaN));
  const tw = useTweenedNumbers(flat, enabled);
  const keySig = keys.join('|');
  return useMemo(() => {
    if (!enabled) return data;
    return data.map((row, i) => {
      const out = { ...row };
      keys.forEach((k, j) => {
        const v = tw[i * keys.length + j];
        out[k] = Number.isNaN(v) ? null : v;
      });
      return out;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tw, enabled, keySig]);
}
