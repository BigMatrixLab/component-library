'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * One cancellable timer for hover intent (tooltip delays, submenu open/close).
 * Starting a new timer replaces the previous one; it is cleared on unmount.
 *   const intent = useHoverIntent();
 *   intent.start(() => setOpen(true), 700);   intent.cancel();
 */
export function useHoverIntent() {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const start = useCallback(
    (fn: () => void, delay: number) => {
      cancel();
      if (delay <= 0) {
        fn();
        return;
      }
      timer.current = setTimeout(() => {
        timer.current = undefined;
        fn();
      }, delay);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return useMemo(() => ({ start, cancel }), [start, cancel]);
}
