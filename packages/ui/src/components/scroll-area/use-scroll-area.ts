'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

type Axis = 'x' | 'y';

const MIN_THUMB = 28;
const SCROLLING_MS = 900;

interface AxisParts {
  track: RefObject<HTMLDivElement | null>;
  thumb: RefObject<HTMLDivElement | null>;
}

/**
 * Drives a ScrollArea: reads the viewport's scroll metrics and writes the custom thumb size and
 * position, the overflow flags and the edge-fade flags straight to the DOM (no re-render per scroll).
 *
 * Root attributes it maintains:
 *   data-overflow-x / data-overflow-y   content overflows on that axis
 *   data-fade-top / -bottom / -left / -right   content continues beyond that edge (only with `fade`)
 *   data-scrolling                      set while scrolling and for a moment afterwards
 *   data-dragging                       a thumb is being dragged
 */
export function useScrollArea({
  rootRef,
  viewportRef,
  fade,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  fade: boolean;
}) {
  const y: AxisParts = { track: useRef<HTMLDivElement>(null), thumb: useRef<HTMLDivElement>(null) };
  const x: AxisParts = { track: useRef<HTMLDivElement>(null), thumb: useRef<HTMLDivElement>(null) };
  const parts = useRef({ x, y });
  parts.current = { x, y };
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ axis: Axis; id: number; startPointer: number; startScroll: number; ratio: number } | null>(null);

  const update = useCallback(() => {
    const root = rootRef.current;
    const vp = viewportRef.current;
    if (!root || !vp) return;
    for (const axis of ['y', 'x'] as const) {
      const { track, thumb } = parts.current[axis];
      const vertical = axis === 'y';
      const client = vertical ? vp.clientHeight : vp.clientWidth;
      const total = vertical ? vp.scrollHeight : vp.scrollWidth;
      const pos = vertical ? vp.scrollTop : vp.scrollLeft;
      const max = total - client;
      const overflow = max > 1;
      root.toggleAttribute(`data-overflow-${axis}`, overflow);
      const start = vertical ? 'data-fade-top' : 'data-fade-left';
      const end = vertical ? 'data-fade-bottom' : 'data-fade-right';
      root.toggleAttribute(start, fade && overflow && pos > 1);
      root.toggleAttribute(end, fade && overflow && pos < max - 1);
      const trackEl = track.current;
      const thumbEl = thumb.current;
      if (!trackEl || !thumbEl) continue;
      trackEl.toggleAttribute('data-hidden', !overflow);
      if (!overflow) continue;
      const trackSize = vertical ? trackEl.clientHeight : trackEl.clientWidth;
      const thumbSize = Math.min(trackSize, Math.max(MIN_THUMB, (trackSize * client) / total));
      const offset = max > 0 ? (Math.min(Math.max(pos, 0), max) / max) * (trackSize - thumbSize) : 0;
      if (vertical) {
        thumbEl.style.height = `${thumbSize}px`;
        thumbEl.style.transform = `translate3d(0, ${offset}px, 0)`;
      } else {
        thumbEl.style.width = `${thumbSize}px`;
        thumbEl.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
    }
  }, [rootRef, viewportRef, fade]);

  useEffect(() => {
    const root = rootRef.current;
    const vp = viewportRef.current;
    if (!root || !vp) return;
    update();
    const onScroll = () => {
      update();
      root.setAttribute('data-scrolling', '');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => root.removeAttribute('data-scrolling'), SCROLLING_MS);
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    let ro: ResizeObserver | undefined;
    let mo: MutationObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(vp);
      const watchChildren = () => {
        ro?.disconnect();
        ro?.observe(vp);
        for (const child of Array.from(vp.children)) ro?.observe(child);
      };
      watchChildren();
      if (typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver(() => {
          watchChildren();
          update();
        });
        mo.observe(vp, { childList: true, subtree: true });
      }
    }
    window.addEventListener('resize', update);
    // Fonts and images can change the content size after the first measurement
    const raf = requestAnimationFrame(update);
    return () => {
      vp.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
      clearTimeout(timer.current);
      ro?.disconnect();
      mo?.disconnect();
    };
  }, [rootRef, viewportRef, update]);

  const onThumbPointerDown = useCallback(
    (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
      const vp = viewportRef.current;
      const trackEl = parts.current[axis].track.current;
      const thumbEl = parts.current[axis].thumb.current;
      if (!vp || !trackEl || !thumbEl || e.button > 0) return;
      e.preventDefault();
      e.stopPropagation();
      const vertical = axis === 'y';
      const trackSize = vertical ? trackEl.clientHeight : trackEl.clientWidth;
      const thumbSize = vertical ? thumbEl.offsetHeight : thumbEl.offsetWidth;
      const scrollRange = (vertical ? vp.scrollHeight - vp.clientHeight : vp.scrollWidth - vp.clientWidth) || 1;
      drag.current = {
        axis,
        id: e.pointerId,
        startPointer: vertical ? e.clientY : e.clientX,
        startScroll: vertical ? vp.scrollTop : vp.scrollLeft,
        // scroll pixels per pointer pixel
        ratio: scrollRange / Math.max(1, trackSize - thumbSize),
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      rootRef.current?.setAttribute('data-dragging', '');
    },
    [rootRef, viewportRef],
  );

  const onThumbPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      const vp = viewportRef.current;
      if (!d || !vp || d.id !== e.pointerId) return;
      const delta = (d.axis === 'y' ? e.clientY : e.clientX) - d.startPointer;
      if (d.axis === 'y') vp.scrollTop = d.startScroll + delta * d.ratio;
      else vp.scrollLeft = d.startScroll + delta * d.ratio;
    },
    [viewportRef],
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      rootRef.current?.removeAttribute('data-dragging');
    },
    [rootRef],
  );

  /** Pressing the empty track pages toward the press. */
  const onTrackPointerDown = useCallback(
    (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
      const vp = viewportRef.current;
      const thumbEl = parts.current[axis].thumb.current;
      if (!vp || !thumbEl || e.target !== e.currentTarget || e.button > 0) return;
      e.preventDefault();
      const rect = thumbEl.getBoundingClientRect();
      const before = axis === 'y' ? e.clientY < rect.top : e.clientX < rect.left;
      const page = (axis === 'y' ? vp.clientHeight : vp.clientWidth) * 0.9;
      const by = before ? -page : page;
      vp.scrollBy(axis === 'y' ? { top: by, behavior: 'smooth' } : { left: by, behavior: 'smooth' });
    },
    [viewportRef],
  );

  return { y, x, onThumbPointerDown, onThumbPointerMove, endDrag, onTrackPointerDown };
}
