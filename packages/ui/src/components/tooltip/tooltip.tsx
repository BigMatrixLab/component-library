'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
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

/** Which tooltip is open and when one last closed, shared by every tooltip in a provider. */
interface Registry {
  active: { id: string; close: () => void } | null;
  lastClosed: number;
}

interface ProviderValue {
  delayDuration: number;
  skipDelayDuration: number;
  registry: Registry;
}

const ProviderContext = createContext<ProviderValue>({
  delayDuration: 700,
  skipDelayDuration: 300,
  registry: { active: null, lastClosed: 0 },
});

export interface TooltipProviderProps {
  /** Hover delay before a tooltip opens, ms. Default 700. */
  delayDuration?: number;
  /**
   * After a tooltip closes, moving to another one within this window opens it
   * with no delay (scanning a toolbar). ms. Default 300.
   */
  skipDelayDuration?: number;
  children?: ReactNode;
}

/** Shares the hover delay and the "skip delay" window between tooltips. Wrap a toolbar or the whole app. */
export function TooltipProvider({ delayDuration = 700, skipDelayDuration = 300, children }: TooltipProviderProps) {
  const registry = useRef<Registry>({ active: null, lastClosed: 0 });
  const value = useMemo(
    () => ({ delayDuration, skipDelayDuration, registry: registry.current }),
    [delayDuration, skipDelayDuration],
  );
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

/* -------------------------------------------------------------------------- */

const CLOSE_GRACE = 100;

interface TooltipContextValue {
  open: boolean;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  /** Open after the hover delay (none inside the skip window). */
  scheduleOpen: () => void;
  /** Close after a short grace so the pointer can travel onto the bubble. */
  scheduleClose: () => void;
  openNow: () => void;
  closeNow: () => void;
  cancel: () => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string) {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tooltip>.`);
  return ctx;
}

export interface TooltipProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the tooltip asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Hover delay for this tooltip, ms. Defaults to the provider's. */
  delayDuration?: number;
  children?: ReactNode;
}

/**
 * Tooltip — short supporting text for a control. Opens on hover after a delay
 * and on keyboard focus; never from touch. The trigger gets aria-describedby.
 */
export function Tooltip({ open: openProp, defaultOpen = false, onOpenChange, delayDuration, children }: TooltipProps) {
  const provider = useContext(ProviderContext);
  const registry = provider.registry;
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const intent = useHoverIntent();

  // Register while open so other tooltips can close this one and skip their delay
  useEffect(() => {
    if (!open) return;
    registry.active = { id, close: () => setOpen(false) };
    return () => {
      if (registry.active?.id === id) registry.active = null;
      registry.lastClosed = Date.now();
    };
  }, [open, registry, id, setOpen]);

  const openNow = useCallback(() => {
    intent.cancel();
    const other = registry.active;
    if (other && other.id !== id) other.close();
    setOpen(true);
  }, [intent, registry, id, setOpen]);

  const closeNow = useCallback(() => {
    intent.cancel();
    setOpen(false);
  }, [intent, setOpen]);

  const scheduleOpen = useCallback(() => {
    const warm =
      (registry.active !== null && registry.active.id !== id) ||
      Date.now() - registry.lastClosed < provider.skipDelayDuration;
    intent.start(openNow, warm ? 0 : (delayDuration ?? provider.delayDuration));
  }, [intent, registry, id, provider, delayDuration, openNow]);

  const scheduleClose = useCallback(() => intent.start(closeNow, CLOSE_GRACE), [intent, closeNow]);

  // Esc closes it (also when only hovering); scrolling closes it too
  useDismiss(open, [], closeNow, { outside: false });
  useEffect(() => {
    if (!open) return;
    const openedAt = Date.now();
    // Focusing a button can scroll it into view; that scroll must not close the tooltip it just opened
    const onScroll = () => {
      if (Date.now() - openedAt > 200) closeNow();
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [open, closeNow]);

  return (
    <TooltipContext.Provider
      value={{
        open,
        contentId: `${id}-content`,
        triggerRef,
        scheduleOpen,
        scheduleClose,
        openNow,
        closeNow,
        cancel: intent.cancel,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

/** Only keyboard focus opens a tooltip; a pointer click focuses the button too and must not. */
function isKeyboardFocus(el: HTMLElement) {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** The element that owns the tooltip. Use `asChild` to wrap your own <Button>. */
export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(function TooltipTrigger(
  { asChild, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, onKeyDown, ...props },
  ref,
) {
  const ctx = useTooltipContext('TooltipTrigger');
  const composed = useComposedRefs(ref, ctx.triggerRef as RefObject<HTMLButtonElement | null>);
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={composed}
      type={asChild ? undefined : 'button'}
      aria-describedby={ctx.open ? ctx.contentId : undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(e);
        if (e.pointerType !== 'touch') ctx.scheduleOpen();
      }}
      onPointerLeave={(e: PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(e);
        ctx.scheduleClose();
      }}
      onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e);
        ctx.closeNow();
      }}
      onFocus={(e: FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        if (isKeyboardFocus(e.currentTarget)) ctx.openNow();
      }}
      onBlur={(e: FocusEvent<HTMLButtonElement>) => {
        onBlur?.(e);
        ctx.closeNow();
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        // Close the tooltip before anything else (a popover around it) reacts to Esc
        if (e.key === 'Escape' && ctx.open) {
          e.preventDefault();
          ctx.closeNow();
        }
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface TooltipContentProps
  extends Omit<
    FloatingContentProps,
    'open' | 'anchorRef' | 'arrow' | 'matchWidth' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
  > {
  /** A keyboard shortcut shown inside the bubble, e.g. "⌘B". */
  shortcut?: ReactNode;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { placement = 'top', offset = 6, shortcut, className, children, onPointerEnter, onPointerLeave, ...props },
  ref,
) {
  const ctx = useTooltipContext('TooltipContent');
  return (
    <FloatingContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.triggerRef}
      placement={placement}
      offset={offset}
      role="tooltip"
      id={ctx.contentId}
      className={cn('ui-tooltip', className)}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        ctx.cancel();
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        ctx.scheduleClose();
      }}
      {...props}
    >
      {children}
      {shortcut != null && <kbd className="ui-tooltip-kbd">{shortcut}</kbd>}
    </FloatingContent>
  );
});
