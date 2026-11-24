'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type AnchorHTMLAttributes,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../lib/slot';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { useHoverIntent } from '../../hooks/use-hover-intent';
import { FloatingContent, type FloatingContentProps } from '../popover/floating-content';

/* -------------------------------------------------------------------------- */

interface HoverCardContextValue {
  open: boolean;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  openNow: () => void;
  closeNow: () => void;
  cancel: () => void;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

function useHoverCardContext(component: string) {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <HoverCard>.`);
  return ctx;
}

export interface HoverCardProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the card asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Hover time before the card opens, ms. Default 700. */
  openDelay?: number;
  /** Time after the pointer leaves the trigger and the card before it closes, ms. Default 300. */
  closeDelay?: number;
  children?: ReactNode;
}

/**
 * HoverCard — a rich preview of a link, shown on hover or keyboard focus.
 * It is a sighted-pointer convenience: it never opens from touch and holds
 * nothing essential (the trigger must work without it).
 */
export function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  children,
}: HoverCardProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const intent = useHoverIntent();

  const openNow = useCallback(() => {
    intent.cancel();
    setOpen(true);
  }, [intent, setOpen]);
  const closeNow = useCallback(() => {
    intent.cancel();
    setOpen(false);
  }, [intent, setOpen]);
  const scheduleOpen = useCallback(() => intent.start(openNow, openDelay), [intent, openNow, openDelay]);
  const scheduleClose = useCallback(() => intent.start(closeNow, closeDelay), [intent, closeNow, closeDelay]);

  const value = useMemo(
    () => ({
      open,
      contentId: `${id}-content`,
      triggerRef,
      scheduleOpen,
      scheduleClose,
      openNow,
      closeNow,
      cancel: intent.cancel,
    }),
    [open, id, scheduleOpen, scheduleClose, openNow, closeNow, intent.cancel],
  );

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}

/* -------------------------------------------------------------------------- */

/** Only keyboard focus opens the card; a click also focuses the link and must not. */
function isKeyboardFocus(el: HTMLElement) {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

function leftBoth(e: FocusEvent, trigger: HTMLElement | null) {
  const next = e.relatedTarget as Node | null;
  if (!next) return true;
  return !trigger?.contains(next) && !(e.currentTarget as Node).contains(next);
}

export interface HoverCardTriggerProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Use your own link (a Next.js <Link>) as the trigger. */
  asChild?: boolean;
}

/** The link or element that opens the card. Renders an `<a>`; give it an `href`. */
export const HoverCardTrigger = forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(function HoverCardTrigger(
  { asChild, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props },
  ref,
) {
  const ctx = useHoverCardContext('HoverCardTrigger');
  const composed = useComposedRefs(ref, ctx.triggerRef as RefObject<HTMLAnchorElement | null>);
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={composed}
      data-state={ctx.open ? 'open' : 'closed'}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(e);
        if (e.pointerType !== 'touch') ctx.scheduleOpen();
      }}
      onPointerLeave={(e: PointerEvent<HTMLAnchorElement>) => {
        onPointerLeave?.(e);
        if (e.pointerType !== 'touch') ctx.scheduleClose();
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(e);
        if (isKeyboardFocus(e.currentTarget)) ctx.openNow();
      }}
      onBlur={(e: FocusEvent<HTMLAnchorElement>) => {
        onBlur?.(e);
        if (leftBoth(e, ctx.triggerRef.current)) ctx.scheduleClose();
        // focus moving into the card keeps it open; the card's own blur closes it later
        else ctx.cancel();
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export type HoverCardContentProps = Omit<
  FloatingContentProps,
  'open' | 'anchorRef' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
>;

/** The preview panel. Stays open while the pointer or focus is on it. */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { placement = 'bottom', offset = 8, className, children, onPointerEnter, onPointerLeave, onBlur, onFocus, ...props },
  ref,
) {
  const ctx = useHoverCardContext('HoverCardContent');

  // Esc closes it, also while only hovering
  useDismiss(ctx.open, [], ctx.closeNow, { outside: false });

  return (
    <FloatingContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.triggerRef}
      placement={placement}
      offset={offset}
      id={ctx.contentId}
      data-hover-card=""
      className={cn('ui-hover-card', className)}
      onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(e);
        if (e.pointerType !== 'touch') ctx.cancel();
      }}
      onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(e);
        if (e.pointerType !== 'touch') ctx.scheduleClose();
      }}
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        onFocus?.(e);
        ctx.cancel();
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        if (leftBoth(e, ctx.triggerRef.current)) ctx.scheduleClose();
      }}
      {...props}
    >
      {children}
    </FloatingContent>
  );
});
