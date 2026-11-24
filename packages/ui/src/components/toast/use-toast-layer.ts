'use client';

import { useEffect, useState } from 'react';

type PopoverElement = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

const MODAL_SELECTORS = [
  'dialog[open]:modal:not([data-state="closed"])',
  'dialog[open][aria-modal="true"]:not([data-state="closed"])',
];

/** The topmost open modal <dialog> that is not already closing. */
function findModalDialog(): HTMLElement | null {
  for (const selector of MODAL_SELECTORS) {
    try {
      const all = document.querySelectorAll<HTMLElement>(selector);
      if (all.length) return all[all.length - 1] ?? null;
    } catch {
      // :modal not supported: try the next selector
    }
  }
  return null;
}

/** Open the layer in the browser's top layer (above every dialog), moving it to the front. */
function showInTopLayer(layer: PopoverElement) {
  if (typeof layer.showPopover !== 'function') return;
  try {
    if (layer.matches(':popover-open')) layer.hidePopover?.();
    layer.showPopover();
  } catch {
    // Not connected yet, or already open: nothing to do
  }
}

/**
 * Creates the element toasts render into and keeps it above everything.
 *
 * It is a `popover="manual"` element, so it lives in the top layer and shows
 * above modal dialogs. A modal dialog makes the rest of the page inert though,
 * which would freeze the toasts (no hover, no clicks). So while a modal dialog
 * is open the layer moves inside it, and moves back to <body> when it closes.
 * Browsers without the Popover API get a fixed, high z-index container.
 */
export function useToastLayer(): HTMLElement | null {
  const [layer, setLayer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div') as PopoverElement;
    el.className = 'ui-toaster-layer';
    const hasPopover = typeof el.showPopover === 'function';
    if (hasPopover) el.setAttribute('popover', 'manual');
    document.body.appendChild(el);
    if (hasPopover) showInTopLayer(el);

    let frame = 0;
    const sync = () => {
      frame = 0;
      const target = findModalDialog() ?? document.body;
      if (el.parentElement === target) return;
      target.appendChild(el); // moving hides a popover, so show it again, on top
      if (hasPopover) showInTopLayer(el);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open', 'data-state'],
    });
    setLayer(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.remove();
      setLayer(null);
    };
  }, []);

  return layer;
}
