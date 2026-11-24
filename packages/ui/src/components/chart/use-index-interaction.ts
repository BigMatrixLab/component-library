'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export interface ActiveState {
  index: number | null;
  /** Pointer position inside the stage (px). Only meaningful when `source` is 'pointer'. */
  x: number;
  y: number;
  source: 'pointer' | 'touch' | 'keyboard' | null;
}

const NONE: ActiveState = { index: null, x: 0, y: 0, source: null };

/**
 * Active-index state for a chart stage: the nearest index follows the pointer
 * (mouse, pen or touch), arrow keys move it, Esc clears it. Touch keeps the
 * readout until the next tap elsewhere.
 */
export function useIndexInteraction(count: number, indexAt: (x: number, y: number) => number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<ActiveState>(NONE);
  const indexAtRef = useRef(indexAt);
  indexAtRef.current = indexAt;

  const fromPointer = useCallback(
    (e: PointerEvent) => {
      const el = ref.current;
      if (!el || count === 0) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const index = indexAtRef.current(x, y);
      setActive((prev) =>
        prev.index === index && prev.x === x && prev.y === y ? prev : { index, x, y, source: e.pointerType === 'touch' ? 'touch' : 'pointer' },
      );
    },
    [count],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (count === 0) return;
      let delta = 0;
      let to: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') delta = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') delta = -1;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = count - 1;
      else if (e.key === 'Escape') {
        setActive(NONE);
        return;
      } else return;
      e.preventDefault();
      setActive((prev) => {
        const base = prev.index;
        const index = to ?? (base == null ? (delta > 0 ? 0 : count - 1) : Math.min(Math.max(base + delta, 0), count - 1));
        return { index, x: 0, y: 0, source: 'keyboard' };
      });
    },
    [count],
  );

  // A tap outside dismisses a touch readout
  useEffect(() => {
    if (active.source !== 'touch') return;
    const off = (e: globalThis.PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setActive(NONE);
    };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [active.source]);

  // Data shrank under an active index
  useEffect(() => {
    setActive((prev) => (prev.index != null && prev.index >= count ? NONE : prev));
  }, [count]);

  const props = {
    ref,
    tabIndex: 0,
    onPointerMove: fromPointer,
    onPointerDown: fromPointer,
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType !== 'touch') setActive(NONE);
    },
    onKeyDown,
    onBlur: () => setActive((prev) => (prev.source === 'keyboard' ? NONE : prev)),
  };

  return { active, props, clear: () => setActive(NONE) };
}
