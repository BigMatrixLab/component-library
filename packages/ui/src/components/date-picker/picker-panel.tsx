'use client';

import { forwardRef, useRef, type FocusEvent, type RefObject } from 'react';
import { useDismiss } from '../../hooks/use-dismiss';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { FloatingContent, type FloatingContentProps } from '../popover/floating-content';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])';

export interface PickerPanelProps
  extends Omit<FloatingContentProps, 'open' | 'anchorRef' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The field the panel hangs from. Clicks on it never count as "outside". */
  anchorRef: RefObject<HTMLElement | null>;
  /** Gets focus back when the panel closes. Default: the anchor. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** What receives focus when the panel opens. Default: the first focusable element. */
  focusSelector?: string;
  /** Runs after focus has moved in (scroll a list to its selection here). */
  onOpened?: (panel: HTMLDivElement) => void;
}

/**
 * The floating surface shared by DatePicker, DateRangePicker and TimePicker:
 * a non-modal dialog in the top layer under the field. Esc and an outside
 * click close it, tabbing out closes it, and focus returns to the field.
 */
export const PickerPanel = forwardRef<HTMLDivElement, PickerPanelProps>(function PickerPanel(
  {
    open,
    onOpenChange,
    anchorRef,
    returnFocusRef,
    focusSelector,
    onOpened,
    placement = 'bottom-start',
    offset = 6,
    className,
    onBlur,
    children,
    ...props
  },
  forwardedRef,
) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);
  const skipFocusReturn = useRef(false);

  useDismiss(open, [panelRef, anchorRef], (reason) => {
    // An outside click already put focus where the person clicked
    skipFocusReturn.current = reason === 'outside';
    onOpenChange(false);
  });

  return (
    <FloatingContent
      ref={ref}
      open={open}
      anchorRef={anchorRef}
      placement={placement}
      offset={offset}
      role="dialog"
      tabIndex={-1}
      className={cn('ui-picker-panel', className)}
      returnFocusRef={returnFocusRef ?? anchorRef}
      skipFocusReturnRef={skipFocusReturn}
      onOpened={(panel) => {
        const target = panel.querySelector<HTMLElement>(focusSelector ?? FOCUSABLE) ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
        target.focus({ preventScroll: true });
        onOpened?.(panel);
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        // Tabbing out of a non-modal panel closes it (focus stays where it went)
        const next = e.relatedTarget as Node | null;
        if (next && !e.currentTarget.contains(next) && !anchorRef.current?.contains(next)) {
          skipFocusReturn.current = true;
          onOpenChange(false);
        }
      }}
      {...props}
    >
      {children}
    </FloatingContent>
  );
});
