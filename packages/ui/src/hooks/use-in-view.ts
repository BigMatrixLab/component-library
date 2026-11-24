'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface UseInViewOptions {
  /** Stop observing after the first time the element is seen. Default `false`. */
  once?: boolean;
  /** IntersectionObserver rootMargin, e.g. `'0px 0px -10% 0px'`. Default `'0px'`. */
  rootMargin?: string;
  /** Visible fraction (0–1) that counts as in view. Default `0`. */
  threshold?: number | number[];
}

/**
 * Whether the referenced element is in the viewport. `false` on the server
 * and before mount (and when IntersectionObserver is missing).
 *   const ref = useRef(null); const seen = useInView(ref, { once: true });
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = false, rootMargin = '0px', threshold = 0 }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : threshold;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, once, rootMargin, thresholdKey]);

  return inView;
}
