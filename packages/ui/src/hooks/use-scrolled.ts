'use client';

import { useEffect, useState, type RefObject } from 'react';

/** The nearest ancestor that scrolls, or the window. */
function findScrollParent(el: HTMLElement): HTMLElement | Window {
  let node = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) return node;
    node = node.parentElement;
  }
  return window;
}

/**
 * True once the scroll container that holds `ref` has scrolled past `threshold`
 * px. Works for the page and for a framed container (docs previews).
 */
export function useScrolled(ref: RefObject<HTMLElement | null>, threshold = 2): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = findScrollParent(el);
    const read = () => {
      const top = target instanceof Window ? target.scrollY : target.scrollTop;
      setScrolled(top > threshold);
    };
    read();
    target.addEventListener('scroll', read, { passive: true });
    return () => target.removeEventListener('scroll', read);
  }, [ref, threshold]);
  return scrolled;
}
