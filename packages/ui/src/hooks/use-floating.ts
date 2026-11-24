'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { computePosition, type PositionOptions } from '../lib/position';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export interface UseFloatingOptions extends PositionOptions {
  open: boolean;
  /** Anchor element, or a virtual anchor (e.g. a pointer position for context menus). */
  anchorRef: RefObject<Element | { getBoundingClientRect(): DOMRect } | null>;
  floatingRef: RefObject<HTMLElement | null>;
  /** Make the panel at least as wide as the anchor (selects, comboboxes). */
  matchWidth?: boolean;
}

const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

/**
 * Positions a floating panel next to its anchor and keeps it there on scroll,
 * resize and size changes. When the browser supports the Popover API the panel
 * is promoted to the top layer, so `overflow: hidden` parents never clip it.
 * The panel must render with `popover="manual"` (see <FloatingPanel>).
 * Writes left/top, data-side, data-align and --ui-origin on the panel.
 */
export function useFloating({ open, anchorRef, floatingRef, matchWidth, ...options }: UseFloatingOptions) {
  const optsRef = useRef(options);
  optsRef.current = options;

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = floatingRef.current;
    if (!anchor || !panel) return;
    const rect = anchor.getBoundingClientRect();
    if (matchWidth) panel.style.minWidth = `${rect.width}px`;
    // offsetWidth/Height ignore the entrance scale transform, so placement is exact
    const pos = computePosition(
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
      optsRef.current,
    );
    panel.style.left = `${pos.x}px`;
    panel.style.top = `${pos.y}px`;
    panel.dataset.side = pos.side;
    panel.dataset.align = pos.align;
    panel.style.setProperty('--ui-origin', pos.origin);
  }, [anchorRef, floatingRef, matchWidth]);

  // Promote to the top layer and position before paint
  useIsomorphicLayoutEffect(() => {
    const panel = floatingRef.current;
    if (!open || !panel) return;
    if (supportsPopover && panel.hasAttribute('popover') && !panel.matches(':popover-open')) {
      try {
        panel.showPopover();
      } catch {
        /* already open or detached */
      }
    }
    update();
  }, [open, update]);

  // Follow scroll, resize and content size changes while open
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (floatingRef.current) ro?.observe(floatingRef.current);
    if (anchorRef.current instanceof Element) ro?.observe(anchorRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro?.disconnect();
    };
  }, [open, update, anchorRef, floatingRef]);

  return { update };
}

/** Hide a top-layer panel after its exit animation (call when presence unmounts). */
export function hidePopover(panel: HTMLElement | null) {
  if (panel && supportsPopover && panel.matches(':popover-open')) {
    try {
      panel.hidePopover();
    } catch {
      /* ignore */
    }
  }
}
