'use client';

import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/dom';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * A single highlight element that glides between the items of a container.
 * Measures the active item and writes `--ui-tab-x/y/w/h` on the container; CSS
 * moves one indicator with a transition. The container gets `data-ready`
 * after the first measurement (so SSR markup never jumps) and `data-animate`
 * two frames later (so the first placement is never animated).
 * The active item is scrolled into view horizontally when the container scrolls.
 *
 * @param containerRef positioned (position: relative) container that holds the items and the indicator
 * @param selector     selects the active item inside the container
 * @param key          changes whenever the active item changes
 */
export function useIndicator(containerRef: RefObject<HTMLElement | null>, selector: string, key: unknown) {
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(selector);
      if (!active) {
        container.removeAttribute('data-ready');
        return;
      }
      const style = container.style;
      style.setProperty('--ui-tab-x', `${active.offsetLeft}px`);
      style.setProperty('--ui-tab-y', `${active.offsetTop}px`);
      style.setProperty('--ui-tab-w', `${active.offsetWidth}px`);
      style.setProperty('--ui-tab-h', `${active.offsetHeight}px`);
      container.setAttribute('data-ready', '');
    };
    measure();
    // Bring the active item into view when the list scrolls
    const active = container.querySelector<HTMLElement>(selector);
    if (active && container.scrollWidth > container.clientWidth) {
      const left = active.offsetLeft - 8;
      const right = active.offsetLeft + active.offsetWidth + 8;
      if (left < container.scrollLeft || right > container.scrollLeft + container.clientWidth) {
        const target = left < container.scrollLeft ? left : right - container.clientWidth;
        container.scrollTo({ left: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    }
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    for (const child of Array.from(container.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [containerRef, selector, key]);

  // Turn the transition on only after the first placement has painted
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => container.setAttribute('data-animate', ''));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [containerRef]);
}
