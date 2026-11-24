'use client';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

/** Lock page scroll while `active` (ref-counted, keeps the scrollbar gap). */
export function useScrollLock(active: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    if (locks++ === 0) {
      const gap = window.innerWidth - root.clientWidth;
      saved = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
      root.style.overflow = 'hidden';
      if (gap > 0) root.style.paddingRight = `${gap}px`;
    }
    return () => {
      if (--locks === 0 && saved) {
        root.style.overflow = saved.overflow;
        root.style.paddingRight = saved.paddingRight;
        saved = null;
      }
    };
  }, [active]);
}
