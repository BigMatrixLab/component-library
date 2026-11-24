'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounces a callback: it runs `delay` ms after the last call.
 * Returns `[call, cancel]`; the pending call is cancelled on unmount.
 * The latest `fn` is always the one that runs.
 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const call = useCallback(
    (...args: A) => {
      cancel();
      if (delay <= 0) {
        fnRef.current(...args);
        return;
      }
      timer.current = setTimeout(() => {
        timer.current = null;
        fnRef.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  useEffect(() => cancel, [cancel]);

  return [call, cancel] as const;
}
