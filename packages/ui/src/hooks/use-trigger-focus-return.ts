'use client';

import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';

/**
 * Give focus back to the trigger when a non-modal floating panel closes.
 * Safari and Firefox don't focus a button on click, so the browser can't be
 * trusted to remember it — keep a ref to the trigger and focus it explicitly.
 *
 * Focus only returns when it is still inside the panel (or lost to <body>);
 * if the person already moved on to something else, it is left alone.
 * Set `skipRef.current = true` before closing (e.g. an outside click) to opt out.
 */
export function useTriggerFocusReturn({
  open,
  panelRef,
  returnRef,
  skipRef,
}: {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  returnRef?: RefObject<HTMLElement | null>;
  skipRef?: MutableRefObject<boolean>;
}) {
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      if (skipRef) skipRef.current = false;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const target = returnRef?.current;
    if (!target?.isConnected || skipRef?.current) return;
    const active = document.activeElement;
    const lost = !active || active === document.body || panelRef.current?.contains(active);
    if (lost) target.focus({ preventScroll: true });
  }, [open, panelRef, returnRef, skipRef]);
}
