'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../lib/dom';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

interface Layer<K extends string> {
  key: K;
  node: ReactNode;
}

/**
 * Keeps the previous layer alive for `duration` ms after `key` changes so CSS
 * can crossfade it out while the new layer fades in.
 *   const { leaving, animate } = useCrossfade(state, content);
 *   <span key={state} data-enter={animate || undefined}>{content}</span>
 *   {leaving && <span key={`out-${leaving.key}`} aria-hidden>{leaving.node}</span>}
 * `animate` is false until the first change, so nothing animates on mount.
 * Under `prefers-reduced-motion` no outgoing layer is kept.
 */
export function useCrossfade<K extends string>(key: K, node: ReactNode, duration = 160) {
  const [leaving, setLeaving] = useState<Layer<K> | null>(null);
  const last = useRef<Layer<K>>({ key, node });
  const changed = useRef(false);
  const timer = useRef(0);

  if (last.current.key !== key) changed.current = true;

  useIsomorphicLayoutEffect(() => {
    const prev = last.current;
    last.current = { key, node };
    if (prev.key === key || prefersReducedMotion()) return;
    window.clearTimeout(timer.current);
    setLeaving(prev);
    timer.current = window.setTimeout(() => setLeaving(null), duration + 40);
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { leaving, animate: changed.current };
}
