'use client';

import { forwardRef, useRef, type HTMLAttributes, type MutableRefObject, type RefObject } from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import type { Align, Placement, Side } from '../../lib/position';
import { useFloating } from '../../hooks/use-floating';
import { usePresence } from '../../hooks/use-presence';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useTriggerFocusReturn } from '../../hooks/use-trigger-focus-return';

export type FloatingAnchor = RefObject<Element | { getBoundingClientRect(): DOMRect } | null>;

/** Combine a placement with an optional `align` override: ("bottom", "end") → "bottom-end". */
export function resolvePlacement(placement: Placement, align?: Align): Placement {
  if (!align) return placement;
  const side = placement.split('-')[0] as Side;
  return align === 'center' ? side : (`${side}-${align}` as Placement);
}

export interface FloatingContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the panel is open. It stays mounted until its exit animation ends. */
  open: boolean;
  anchorRef: FloatingAnchor;
  /** Preferred side (and alignment) next to the anchor. Flips when there is no room. */
  placement?: Placement;
  /** Overrides the alignment part of `placement`. */
  align?: Align;
  /** Gap between anchor and panel, px. */
  offset?: number;
  /** Make the panel at least as wide as the anchor. */
  matchWidth?: boolean;
  /** Draw a small arrow pointing at the anchor. */
  arrow?: boolean;
  /** Runs once the panel is open, in the top layer and positioned (move focus here). */
  onOpened?: (panel: HTMLDivElement) => void;
  /** Element that gets focus back when the panel closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Set `.current = true` before closing to skip the focus return (outside click). */
  skipFocusReturnRef?: MutableRefObject<boolean>;
}

/**
 * Shared floating panel for Tooltip, Popover and DropdownMenu: a
 * `popover="manual"` element in the browser top layer, positioned by
 * useFloating, kept mounted for its exit animation (usePresence).
 * Styling lives in each component's own classes; `.ui-floating` only sets
 * up positioning.
 */
export const FloatingContent = forwardRef<HTMLDivElement, FloatingContentProps>(function FloatingContent(
  {
    open,
    anchorRef,
    placement = 'bottom',
    align,
    offset = 6,
    matchWidth,
    arrow,
    onOpened,
    returnFocusRef,
    skipFocusReturnRef,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const { mounted, state, ref: presenceRef } = usePresence<HTMLDivElement>(open);
  const ref = useComposedRefs(forwardedRef, presenceRef);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;

  useFloating({
    open,
    anchorRef,
    floatingRef: presenceRef,
    placement: resolvePlacement(placement, align),
    offset,
    matchWidth,
  });

  // After useFloating's layout effect: the panel is shown and placed.
  useIsomorphicLayoutEffect(() => {
    if (open && presenceRef.current) onOpenedRef.current?.(presenceRef.current);
  }, [open, presenceRef]);

  useTriggerFocusReturn({ open, panelRef: presenceRef, returnRef: returnFocusRef, skipRef: skipFocusReturnRef });

  // Keep the arrow over the anchor's centre, even when the panel was shifted into view
  useIsomorphicLayoutEffect(() => {
    const panel = presenceRef.current;
    const el = arrowRef.current;
    if (!arrow || !open || !panel || !el) return;
    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const a = anchor.getBoundingClientRect();
      const vertical = panel.dataset.side === 'top' || panel.dataset.side === 'bottom';
      const size = vertical ? panel.offsetWidth : panel.offsetHeight;
      const start = parseFloat(vertical ? panel.style.left : panel.style.top) || 0;
      const center = (vertical ? a.left + a.width / 2 : a.top + a.height / 2) - start;
      el.style.setProperty('--ui-arrow-offset', `${Math.round(Math.min(Math.max(center, 16), size - 16))}px`);
    };
    place();
    const observer = new MutationObserver(place);
    observer.observe(panel, { attributes: true, attributeFilter: ['style', 'data-side'] });
    return () => observer.disconnect();
  }, [arrow, open, anchorRef, presenceRef]);

  if (!mounted) return null;

  return (
    <div ref={ref} popover="manual" data-state={state} className={cn('ui-floating', className)} {...props}>
      {children}
      {arrow && <span ref={arrowRef} className="ui-floating-arrow" aria-hidden="true" />}
    </div>
  );
});
