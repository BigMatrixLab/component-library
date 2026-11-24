'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';

export type Orientation = 'vertical' | 'horizontal' | 'both';

const isDisabled = (el: HTMLElement) =>
  el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('data-disabled');

/**
 * Arrow-key focus movement across items inside a container, with Home/End
 * and typeahead. Spread the returned handler on the container:
 *   const onKeyDown = useRovingFocus({ itemSelector: '[role="menuitem"]' });
 *   <div role="menu" onKeyDown={onKeyDown}>…</div>
 */
export function useRovingFocus({
  itemSelector,
  orientation = 'vertical',
  loop = true,
  typeahead = true,
  onMove,
}: {
  itemSelector: string;
  orientation?: Orientation;
  loop?: boolean;
  typeahead?: boolean;
  onMove?: (item: HTMLElement) => void;
}) {
  const buffer = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(itemSelector)).filter(
        (el) => !isDisabled(el) && el.getClientRects().length > 0,
      );
      if (!items.length) return;
      const active = document.activeElement as HTMLElement | null;
      const index = items.findIndex((el) => el === active || (active !== null && el.contains(active)));
      const go = (item: HTMLElement | undefined) => {
        if (!item) return;
        e.preventDefault();
        item.focus();
        onMove?.(item);
      };
      const step = (delta: number) => {
        if (index === -1) return items[delta > 0 ? 0 : items.length - 1];
        let next = index + delta;
        if (loop) next = (next + items.length) % items.length;
        else next = Math.max(0, Math.min(items.length - 1, next));
        return items[next];
      };
      const v = orientation !== 'horizontal';
      const h = orientation !== 'vertical';
      switch (e.key) {
        case 'ArrowDown':
          if (v) go(step(1));
          return;
        case 'ArrowUp':
          if (v) go(step(-1));
          return;
        case 'ArrowRight':
          if (h) go(step(1));
          return;
        case 'ArrowLeft':
          if (h) go(step(-1));
          return;
        case 'Home':
          go(items[0]);
          return;
        case 'End':
          go(items[items.length - 1]);
          return;
      }
      if (!typeahead || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).matches('input, textarea')) return;
      clearTimeout(timer.current);
      buffer.current += e.key.toLowerCase();
      timer.current = setTimeout(() => {
        buffer.current = '';
      }, 500);
      go(items.find((el) => (el.textContent ?? '').trim().toLowerCase().startsWith(buffer.current)));
    },
    [itemSelector, orientation, loop, typeahead, onMove],
  );
}
