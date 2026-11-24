'use client';

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

export interface UsePressRepeatOptions {
  /** Keep firing while the pointer is held down. Default true. */
  repeat?: boolean;
  /** Wait before the first repeat, ms. Default 400. */
  initialDelay?: number;
  /** First repeat interval, ms. Shrinks while held. Default 110. */
  interval?: number;
  /** Fastest interval, ms. Default 35. */
  minInterval?: number;
  /** Pass a growing multiplier (1, 2, 5, 10) to `onStep` the longer the press lasts. Default true. */
  accelerate?: boolean;
}

/**
 * Press-and-hold for stepper buttons. `onStep(multiplier)` runs once on press and then
 * repeats; return `false` when nothing changed (a bound was hit) to stop the repeat.
 * Spread the result on the button. Keyboard / assistive-tech clicks (`detail === 0`)
 * step once through `onClick`.
 */
export function usePressRepeat(
  onStep: (multiplier: number) => boolean | void,
  { repeat = true, initialDelay = 400, interval = 110, minInterval = 35, accelerate = true }: UsePressRepeatOptions = {},
) {
  const stepRef = useRef(onStep);
  stepRef.current = onStep;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cleanup = useRef<(() => void) | undefined>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    cleanup.current?.();
    cleanup.current = undefined;
  }, []);

  useEffect(() => stop, [stop]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || !e.isPrimary) return;
      // Keep focus where it is (the input) instead of moving it onto the button
      e.preventDefault();
      stop();
      if (stepRef.current(1) === false || !repeat) return;

      let ticks = 0;
      let delay = interval;
      const tick = () => {
        ticks += 1;
        const multiplier = !accelerate ? 1 : ticks > 40 ? 10 : ticks > 24 ? 5 : ticks > 12 ? 2 : 1;
        if (stepRef.current(multiplier) === false) {
          stop();
          return;
        }
        delay = Math.max(minInterval, delay * 0.93);
        timer.current = setTimeout(tick, delay);
      };
      timer.current = setTimeout(tick, initialDelay);

      const end = () => stop();
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
      window.addEventListener('blur', end);
      cleanup.current = () => {
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        window.removeEventListener('blur', end);
      };
    },
    [stop, repeat, initialDelay, interval, minInterval, accelerate],
  );

  const onClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if (e.detail === 0) stepRef.current(1);
  }, []);

  const onMouseDown = useCallback((e: MouseEvent<HTMLElement>) => e.preventDefault(), []);
  const onContextMenu = useCallback((e: MouseEvent<HTMLElement>) => e.preventDefault(), []);

  return { onPointerDown, onClick, onMouseDown, onContextMenu };
}
