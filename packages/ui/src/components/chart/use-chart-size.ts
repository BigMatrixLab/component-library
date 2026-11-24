'use client';

import { useRef, useState, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';

/**
 * Width of an element, kept in sync with a ResizeObserver.
 * Returns 0 until measured (always on the server), so charts render a
 * correctly sized placeholder first and never touch `window` during render.
 */
export function useChartSize<T extends HTMLElement>(): { ref: RefObject<T | null>; width: number } {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(Math.round(el.getBoundingClientRect().width));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
