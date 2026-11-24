'use client';

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { animationsFinished } from '../../lib/dom';
import { useComposedRefs } from '../../lib/compose-refs';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';

export interface CollapseProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** Called when the browser reveals the region (find-in-page matched text inside it). */
  onReveal: () => void;
}

/**
 * The animated region shared by Accordion and Collapsible.
 * A grid whose single row animates 0fr to 1fr (CSS keyframes on the smooth
 * spring), so height follows the content with no measuring. The content stays
 * in the DOM when closed with `hidden="until-found"`, so find-in-page (Ctrl+F)
 * can open it where the browser supports that; elsewhere it is plain `hidden`.
 */
export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  { open, onReveal, className, children, ...props },
  forwardedRef,
) {
  const elRef = useRef<HTMLDivElement>(null);
  const ref = useComposedRefs(forwardedRef, elRef);
  // `hidden` is applied only after the closing animation has finished
  const [settledClosed, setSettledClosed] = useState(!open);
  // No animation on the first render (an item that starts open must not play its entrance)
  const animate = useRef(false);
  useEffect(() => {
    animate.current = true;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (open) {
      setSettledClosed(false);
      return;
    }
    let cancelled = false;
    animationsFinished(elRef.current, false).then(() => {
      if (!cancelled) setSettledClosed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // `beforematch` fires when find-in-page is about to reveal text inside the hidden region
  const reveal = useRef(onReveal);
  reveal.current = onReveal;
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const on = () => reveal.current();
    el.addEventListener('beforematch', on);
    return () => el.removeEventListener('beforematch', on);
  }, []);

  const hidden = !open && settledClosed;
  return (
    <div
      ref={ref}
      data-state={open ? 'open' : 'closed'}
      data-animate={animate.current ? '' : undefined}
      hidden={hidden ? ('until-found' as unknown as boolean) : undefined}
      className={cn('ui-collapse', className)}
      {...props}
    >
      <div className="ui-collapse-inner">{children}</div>
    </div>
  );
});
