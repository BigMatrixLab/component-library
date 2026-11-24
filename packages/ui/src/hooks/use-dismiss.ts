'use client';

import { useEffect, useRef, type RefObject } from 'react';

export type DismissReason = 'escape' | 'outside';

/**
 * Call `onDismiss` on Escape or a pointerdown outside every element in `refs`.
 * Used by popovers, menus, selects — anything non-modal that floats.
 */
export function useDismiss(
  enabled: boolean,
  refs: RefObject<Element | null>[],
  onDismiss: (reason: DismissReason) => void,
  { escape = true, outside = true }: { escape?: boolean; outside?: boolean } = {},
) {
  const cb = useRef(onDismiss);
  cb.current = onDismiss;
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (escape && e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        cb.current('escape');
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (refsRef.current.some((r) => r.current?.contains(target))) return;
      cb.current('outside');
    };
    document.addEventListener('keydown', onKey);
    if (outside) document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [enabled, escape, outside]);
}
