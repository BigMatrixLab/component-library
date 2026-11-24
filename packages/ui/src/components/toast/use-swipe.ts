'use client';

import { useCallback, useRef, useState, type PointerEvent, type RefObject } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/** Distance (px) past which a release dismisses. */
export const SWIPE_THRESHOLD = 45;
/** Speed (px/ms) past which a quick flick dismisses, whatever the distance. */
export const SWIPE_VELOCITY = 0.11;
/** Movement (px) before the gesture picks an axis. */
const LOCK_DISTANCE = 6;

const SIGN: Record<SwipeDirection, number> = { left: -1, right: 1, up: -1, down: 1 };

interface Gesture {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  axis: 'x' | 'y' | null;
  amount: number;
}

export interface UseSwipeOptions {
  enabled: boolean;
  /** Directions that dismiss, e.g. ['right'] for a toast docked right. */
  directions: SwipeDirection[];
  onDismiss: (direction: SwipeDirection) => void;
}

/**
 * Swipe-to-dismiss with pointer events (mouse, pen and touch alike).
 * The element follows the pointer through the CSS variables
 * `--ui-toast-swipe-x` / `--ui-toast-swipe-y`; the axis locks after 6px.
 * Releasing past 45px, or faster than .11px/ms, dismisses; otherwise it springs back.
 * Pair the element with `touch-action: none` so touch drags don't scroll the page.
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, { enabled, directions, onDismiss }: UseSwipeOptions) {
  const gesture = useRef<Gesture | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipedOut, setSwipedOut] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const setOffset = (axis: 'x' | 'y', value: number) => {
    ref.current?.style.setProperty(axis === 'x' ? '--ui-toast-swipe-x' : '--ui-toast-swipe-y', `${value}px`);
  };
  const clearOffset = () => {
    ref.current?.style.removeProperty('--ui-toast-swipe-x');
    ref.current?.style.removeProperty('--ui-toast-swipe-y');
  };

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || swipedOut || (e.pointerType === 'mouse' && e.button !== 0)) return;
      gesture.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, time: Date.now(), axis: null, amount: 0 };
    },
    [enabled, swipedOut],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const g = gesture.current;
      if (!g || g.pointerId !== e.pointerId) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_DISTANCE) return;
        const axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        const allowed = directions.some((d) => (axis === 'x') === (d === 'left' || d === 'right'));
        if (!allowed) {
          gesture.current = null; // a drag along an axis that can't dismiss: let it be
          return;
        }
        g.axis = axis;
        // Capture only now, so a plain tap on a button inside still produces its click.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        window.getSelection()?.removeAllRanges();
        setSwiping(true);
      }
      const amount = g.axis === 'x' ? dx : dy;
      g.amount = amount;
      const signs = directions.filter((d) => (g.axis === 'x') === (d === 'left' || d === 'right')).map((d) => SIGN[d]);
      const allowedSign = signs.includes(Math.sign(amount));
      // Against the dismiss direction the toast resists instead of following.
      const shown = allowedSign ? amount : Math.sign(amount) * Math.min(10, Math.abs(amount) * 0.12);
      setOffset(g.axis, shown);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [directions],
  );

  const finish = useCallback(
    (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
      const g = gesture.current;
      if (!g || g.pointerId !== e.pointerId) return;
      gesture.current = null;
      if (!g.axis) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setSwiping(false);
      const elapsed = Math.max(1, Date.now() - g.time);
      const sign = Math.sign(g.amount);
      const direction = directions.find((d) => (g.axis === 'x') === (d === 'left' || d === 'right') && SIGN[d] === sign);
      const fast = Math.abs(g.amount) / elapsed > SWIPE_VELOCITY;
      if (!cancelled && direction && (Math.abs(g.amount) >= SWIPE_THRESHOLD || fast)) {
        const el = ref.current;
        const size = (g.axis === 'x' ? el?.offsetWidth : el?.offsetHeight) ?? 0;
        setOffset(g.axis, sign * (size + 32));
        setSwipedOut(true);
        onDismissRef.current(direction);
      } else {
        clearOffset(); // springs back through the CSS transition
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [directions],
  );

  return {
    swiping,
    swipedOut,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: PointerEvent<HTMLElement>) => finish(e, false),
      onPointerCancel: (e: PointerEvent<HTMLElement>) => finish(e, true),
    },
  };
}
