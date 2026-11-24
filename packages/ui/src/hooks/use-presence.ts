'use client';

import { useRef, useState } from 'react';
import { animationsFinished } from '../lib/dom';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * Keeps an element mounted until its exit animation has finished.
 *   const { mounted, state, ref } = usePresence(open);
 *   {mounted && <div ref={ref} data-state={state} />}
 * CSS animates on [data-state="open" | "closed"]; nothing else is needed.
 */
export function usePresence<T extends Element = HTMLElement>(present: boolean) {
  const [mounted, setMounted] = useState(present);
  const ref = useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (present) {
      setMounted(true);
      return;
    }
    let cancelled = false;
    animationsFinished(ref.current).then(() => {
      if (!cancelled) setMounted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [present]);

  return {
    mounted: present || mounted,
    state: (present ? 'open' : 'closed') as 'open' | 'closed',
    ref,
  };
}
