'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Track a CSS media query. `false` on the server and during hydration, so
 * markup always matches; it updates right after mount and on change.
 *   const wide = useMediaQuery('(min-width: 640px)');
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
