'use client';

import { useCallback, useRef, type FocusEvent } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';

const isOff = (el: HTMLElement) => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

/**
 * Roving tabindex: exactly one item of the group is in the tab order.
 * The focused item wins, then the one matching `preferred` (pressed / checked),
 * then the first enabled item. Attach `ref` and `onFocus` to the group element.
 */
export function useTabStop<T extends HTMLElement = HTMLDivElement>(itemSelector: string, preferred: string) {
  const ref = useRef<T>(null);

  const apply = useCallback(
    (target?: HTMLElement | null) => {
      const root = ref.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
      const enabled = items.filter((el) => !isOff(el));
      const active = document.activeElement as HTMLElement | null;
      const stop =
        target ??
        enabled.find((el) => el === active) ??
        enabled.find((el) => el.matches(preferred)) ??
        enabled[0];
      for (const el of items) el.tabIndex = el === stop ? 0 : -1;
    },
    [itemSelector, preferred],
  );

  // Every render: pressed / checked / disabled may have changed
  useIsomorphicLayoutEffect(() => {
    apply();
  });

  const onFocus = useCallback(
    (e: FocusEvent<T>) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(itemSelector);
      if (item && !isOff(item)) apply(item);
    },
    [apply, itemSelector],
  );

  return { ref, onFocus };
}
