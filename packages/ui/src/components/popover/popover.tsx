'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type MouseEvent,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../lib/slot';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { FloatingContent, type FloatingContentProps } from './floating-content';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
  /** The trigger, so focus can return to it (Safari/Firefox don't focus buttons on click). */
  triggerRef: RefObject<HTMLElement | null>;
  skipFocusReturn: MutableRefObject<boolean>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Popover>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the popover asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Popover — a small, non-modal surface anchored to its trigger. It floats in
 * the browser top layer, so it is never clipped by an overflow: hidden parent.
 */
export function Popover({ open: openProp, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const skipFocusReturn = useRef(false);
  return (
    <PopoverContext.Provider
      value={{ open, setOpen, contentId: `${id}-content`, triggerId: `${id}-trigger`, triggerRef, skipFocusReturn }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Toggles the popover. Use `asChild` to make your own <Button> the trigger. */
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = usePopoverContext('PopoverTrigger');
  const composed = useComposedRefs(ref, ctx.triggerRef as RefObject<HTMLButtonElement | null>);
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={composed}
      id={ctx.triggerId}
      type={asChild ? undefined : 'button'}
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface PopoverContentProps
  extends Omit<FloatingContentProps, 'open' | 'anchorRef' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'> {
  /** Close on Esc and on a click outside. Default true. */
  dismissible?: boolean;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { placement = 'bottom', offset, arrow, dismissible = true, className, onBlur, children, ...props },
  forwardedRef,
) {
  const ctx = usePopoverContext('PopoverContent');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);

  useDismiss(
    ctx.open && dismissible,
    [panelRef, ctx.triggerRef],
    (reason) => {
      // An outside click already put focus where the person clicked
      ctx.skipFocusReturn.current = reason === 'outside';
      ctx.setOpen(false);
    },
  );

  const labelled = !props['aria-label'] && !props['aria-labelledby'];

  return (
    <FloatingContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.triggerRef}
      placement={placement}
      offset={offset ?? (arrow ? 10 : 6)}
      arrow={arrow}
      role="dialog"
      id={ctx.contentId}
      tabIndex={-1}
      aria-labelledby={labelled ? ctx.triggerRef.current?.id || ctx.triggerId : undefined}
      className={cn('ui-popover', className)}
      returnFocusRef={ctx.triggerRef}
      skipFocusReturnRef={ctx.skipFocusReturn}
      onOpened={(panel) => {
        // Move focus in: an [autofocus] field, else the first tabbable element, else the panel
        const target =
          panel.querySelector<HTMLElement>('[data-autofocus], [autofocus]') ?? panel.querySelector<HTMLElement>(TABBABLE) ?? panel;
        target.focus({ preventScroll: true });
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        // Tabbing out of a non-modal popover closes it (focus stays where it went)
        const next = e.relatedTarget as Node | null;
        if (dismissible && next && !e.currentTarget.contains(next) && !ctx.triggerRef.current?.contains(next)) {
          ctx.skipFocusReturn.current = true;
          ctx.setOpen(false);
        }
      }}
      {...props}
    >
      {children}
    </FloatingContent>
  );
});

/* -------------------------------------------------------------------------- */

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Closes the popover. Wrap your own button with `asChild`. */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = usePopoverContext('PopoverClose');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : 'button'}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(false);
      }}
      {...props}
    />
  );
});
