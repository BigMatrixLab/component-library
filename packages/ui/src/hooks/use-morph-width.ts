'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/dom';
import { animateSafe, readSpring, type SpringName } from '../lib/spring';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * Springs an element's width to its new natural width whenever `key` changes
 * (a label swap, a state change). The element keeps `width: auto`; this
 * measures the old and new widths and animates between them with the Web
 * Animations API, so content never snaps. Interruptible: a change mid-flight
 * starts from the width currently on screen. Skipped for the first render
 * and under `prefers-reduced-motion`.
 *
 * The element should clip its overflow (`overflow: hidden`) so the outgoing
 * content does not spill while the width is still catching up.
 */
export function useMorphWidth(ref: RefObject<HTMLElement | null>, key: unknown, spring: SpringName = 'morph') {
  const previous = useRef<number | null>(null);
  const animation = useRef<Animation | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Width on screen right now (mid-flight animations included)
    const visual = el.getBoundingClientRect().width;
    const running = animation.current && animation.current.playState === 'running';
    animation.current?.cancel();
    animation.current = null;
    const natural = el.getBoundingClientRect().width;
    const from = running ? visual : previous.current;
    previous.current = natural;
    if (from === null || Math.abs(from - natural) < 1 || prefersReducedMotion()) return;
    const { easing, duration } = readSpring(spring, el);
    const anim = animateSafe(el, [{ width: `${from}px` }, { width: `${natural}px` }], { duration, easing });
    if (!anim) return;
    animation.current = anim;
    anim.onfinish = () => {
      if (animation.current === anim) animation.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, key, spring]);

  useEffect(
    () => () => {
      animation.current?.cancel();
    },
    [],
  );
}
