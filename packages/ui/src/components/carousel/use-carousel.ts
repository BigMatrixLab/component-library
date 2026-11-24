'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { prefersReducedMotion } from '../../lib/dom';

export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselState {
  /** Index of the first snap position in view (0-based). */
  index: number;
  /** Number of positions the track can rest on (slides minus those that fit at the end). */
  snaps: number;
  canPrev: boolean;
  canNext: boolean;
}

export interface UseCarouselOptions {
  orientation: CarouselOrientation;
  loop: boolean;
  /** `true` or an interval in ms (default 5000). */
  autoplay: boolean | number;
  onIndexChange?: (index: number) => void;
}

const ITEM = '.ui-carousel-item';
const DEFAULT_INTERVAL = 5000;

/**
 * State and behaviour of a Carousel. The track is a native scroll-snap container; this hook only reads it
 * (position, which slide is in view) and nudges it (previous, next, go to). Active slide is kept in sync
 * with an IntersectionObserver on the slides, so touch swipes, trackpads and keys all update the dots.
 */
export function useCarousel({ orientation, loop, autoplay, onIndexChange }: UseCarouselOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const vertical = orientation === 'vertical';
  const [state, setState] = useState<CarouselState>({ index: 0, snaps: 0, canPrev: false, canNext: true });
  const stateRef = useRef(state);
  stateRef.current = state;
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;
  const paused = useRef({ hover: false, focus: false });

  const getItems = useCallback(
    () => (contentRef.current ? (Array.from(contentRef.current.children).filter((el) => el.matches(ITEM)) as HTMLElement[]) : []),
    [],
  );

  /** Recompute which snap position is showing, how many there are and whether either end is reachable. */
  const measure = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const items = getItems();
    const pos = vertical ? vp.scrollTop : vp.scrollLeft;
    const size = vertical ? vp.clientHeight : vp.clientWidth;
    const total = vertical ? vp.scrollHeight : vp.scrollWidth;
    const max = Math.max(0, total - size);
    const offsets = items.map((el) => (vertical ? el.offsetTop : el.offsetLeft));
    // A slide is a stopping point only if the track can scroll far enough to put it at the start
    const stops = offsets.filter((o) => o <= max + 1);
    const snaps = max <= 1 ? Math.min(1, items.length) : Math.max(1, stops.length);
    let index = 0;
    if (pos > 1) {
      if (pos >= max - 1) index = snaps - 1;
      else {
        let best = Infinity;
        stops.forEach((o, i) => {
          const d = Math.abs(o - pos);
          if (d < best) {
            best = d;
            index = i;
          }
        });
      }
    }
    const next: CarouselState = { index, snaps, canPrev: loop ? snaps > 1 : pos > 1, canNext: loop ? snaps > 1 : pos < max - 1 };
    setState((prev) =>
      prev.index === next.index && prev.snaps === next.snaps && prev.canPrev === next.canPrev && prev.canNext === next.canNext ? prev : next,
    );
  }, [getItems, vertical, loop]);

  const scrollTo = useCallback(
    (i: number) => {
      const vp = viewportRef.current;
      const items = getItems();
      if (!vp || !items.length) return;
      const target = items[Math.max(0, Math.min(items.length - 1, i))]!;
      const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
      vp.scrollTo(vertical ? { top: target.offsetTop, behavior } : { left: target.offsetLeft, behavior });
    },
    [getItems, vertical],
  );

  const scrollNext = useCallback(() => {
    const { index, snaps } = stateRef.current;
    if (index < snaps - 1) scrollTo(index + 1);
    else if (loop) scrollTo(0);
  }, [scrollTo, loop]);

  const scrollPrev = useCallback(() => {
    const { index, snaps } = stateRef.current;
    if (index > 0) scrollTo(index - 1);
    else if (loop) scrollTo(snaps - 1);
  }, [scrollTo, loop]);

  // Observe slides, label them "n of m", and re-measure when slides come and go or the size changes
  useEffect(() => {
    const vp = viewportRef.current;
    const content = contentRef.current;
    if (!vp || !content) return;
    let io: IntersectionObserver | undefined;
    const refresh = () => {
      const items = getItems();
      items.forEach((el, i) => {
        if (!el.hasAttribute('data-custom-label')) el.setAttribute('aria-label', `${i + 1} of ${items.length}`);
      });
      io?.disconnect();
      if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(measure, { root: vp, threshold: [0, 0.25, 0.5, 0.75, 1] });
        items.forEach((el) => io!.observe(el));
      }
      measure();
    };
    refresh();
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(refresh) : undefined;
    mo?.observe(content, { childList: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    ro?.observe(vp);
    ro?.observe(content);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    vp.addEventListener('scrollend', measure);
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener('scroll', onScroll);
      vp.removeEventListener('scrollend', measure);
      io?.disconnect();
      mo?.disconnect();
      ro?.disconnect();
    };
  }, [getItems, measure]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onIndexChangeRef.current?.(state.index);
  }, [state.index]);

  // Autoplay: tick on an interval; skip while hovered, focused, in a hidden tab or under reduced motion
  const interval = autoplay === true ? DEFAULT_INTERVAL : autoplay || 0;
  useEffect(() => {
    if (!interval) return;
    const id = setInterval(() => {
      if (paused.current.hover || paused.current.focus || document.hidden || prefersReducedMotion()) return;
      const { index, snaps } = stateRef.current;
      if (snaps <= 1) return;
      scrollTo(index < snaps - 1 ? index + 1 : 0);
    }, interval);
    return () => clearInterval(id);
  }, [interval, scrollTo]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      if (e.key === prevKey) {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === nextKey) {
        e.preventDefault();
        scrollNext();
      }
    },
    [vertical, scrollPrev, scrollNext],
  );

  const pauseProps = useMemo(
    () => ({
      onMouseEnter: () => {
        paused.current.hover = true;
      },
      onMouseLeave: () => {
        paused.current.hover = false;
      },
      onFocus: () => {
        paused.current.focus = true;
      },
      onBlur: (e: FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) paused.current.focus = false;
      },
    }),
    [],
  );

  return { viewportRef, contentRef, state, scrollTo, scrollNext, scrollPrev, onKeyDown, pauseProps, autoplaying: interval > 0 };
}
