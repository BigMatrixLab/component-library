/** True when rendering on the server (no DOM). */
export const isServer = typeof window === 'undefined';

/** Resolve once every animation on `el` (and its subtree) has finished. */
export function animationsFinished(el: Element | null, subtree = true): Promise<void> {
  if (!el || typeof el.getAnimations !== 'function') return Promise.resolve();
  return new Promise((resolve) => {
    // Wait a frame so animations triggered by the state change have started.
    requestAnimationFrame(() => {
      const anims = el.getAnimations({ subtree });
      if (!anims.length) return resolve();
      Promise.allSettled(anims.map((a) => a.finished)).then(() => resolve());
    });
  });
}

export function prefersReducedMotion(): boolean {
  return !isServer && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
