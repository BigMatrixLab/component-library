'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDragDismiss } from '../../hooks/use-drag-dismiss';
import { usePresence } from '../../hooks/use-presence';
import { useScrollLock } from '../../hooks/use-scroll-lock';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';

/* -------------------------------------------------------------------------- */

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (v: boolean) => void;
  setHasDescription: (v: boolean) => void;
  /** The trigger, so focus can return to it (Safari/Firefox do not focus buttons on click). */
  triggerRef: RefObject<HTMLElement | null>;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(component: string) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Sheet>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface SheetProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the sheet asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Sheet — a panel that slides in from an edge for focused work that should
 * keep the page in view. Built on native <dialog> like Dialog: top layer,
 * focus containment and an inert page come from the browser.
 */
export function Sheet({ open: openProp, defaultOpen = false, onOpenChange, children }: SheetProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  return (
    <SheetContext.Provider
      value={{
        open,
        setOpen,
        contentId: `${id}-content`,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
        hasTitle,
        hasDescription,
        setHasTitle,
        setHasDescription,
        triggerRef,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface SheetTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Opens the sheet. Use `asChild` to make your own <Button> the trigger. */
export const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(function SheetTrigger(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = useSheetContext('SheetTrigger');
  const composed = useComposedRefs(ref, ctx.triggerRef as RefObject<HTMLButtonElement | null>);
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={composed}
      type={asChild ? undefined : 'button'}
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(true);
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export type SheetSide = 'right' | 'left' | 'top' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SheetContentProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  /** Edge the sheet slides in from. Default `right`. */
  side?: SheetSide;
  /** Width of a side sheet (320 / 400 / 520 / 640px) or max width of a top/bottom sheet. Default `md`. */
  size?: SheetSize;
  /** Close on Esc and overlay click. Default true. */
  dismissible?: boolean;
  /** Show the × button in the corner. Default true. */
  showClose?: boolean;
  /** Grab handle + drag-to-dismiss on a bottom sheet. Default true. */
  showHandle?: boolean;
  /** Let a left/right sheet fill the whole screen width on phones. Default false. */
  mobileFull?: boolean;
  /** Class for the inner panel. `className` styles the overlay layer. */
  panelClassName?: string;
}

export const SheetContent = forwardRef<HTMLDialogElement, SheetContentProps>(function SheetContent(
  {
    side = 'right',
    size = 'md',
    dismissible = true,
    showClose = true,
    showHandle = true,
    mobileFull = false,
    className,
    panelClassName,
    children,
    onCancel,
    onClick,
    onPointerDown,
    ...props
  },
  forwardedRef,
) {
  const ctx = useSheetContext('SheetContent');
  const { mounted, state, ref: presenceRef } = usePresence<HTMLDialogElement>(ctx.open);
  const ref = useComposedRefs(forwardedRef, presenceRef);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const downOnBackdrop = useRef(false);
  // The panel mounts only after showModal(), so React's `autoFocus` (which runs
  // when an element mounts) lands on a visible element inside the open sheet.
  const [ready, setReady] = useState(false);
  useScrollLock(ctx.open);

  const close = useCallback(() => ctx.setOpen(false), [ctx]);
  const draggable = side === 'bottom' && showHandle;
  const drag = useDragDismiss({ side, enabled: draggable, panelRef, layerRef: presenceRef, onDismiss: close });

  // 1. Open as a modal in the top layer.
  useIsomorphicLayoutEffect(() => {
    const dialog = presenceRef.current;
    if (!mounted || !ctx.open || !dialog || dialog.open) return;
    const active = document.activeElement as HTMLElement | null;
    returnFocusRef.current = active && active !== document.body ? active : ctx.triggerRef.current;
    dialog.showModal();
    setReady(true);
  }, [mounted, ctx.open]);

  // 2. Once the content is in: keep an autoFocus'd field, else focus the panel.
  useIsomorphicLayoutEffect(() => {
    if (!ready || !ctx.open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const auto = panel.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    if (auto && document.activeElement !== auto) auto.focus({ preventScroll: true });
    else if (!panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
  }, [ready, ctx.open]);

  // 3. After the exit animation unmounts the sheet, give focus back.
  useEffect(() => {
    if (mounted) return;
    setReady(false);
    const el = returnFocusRef.current;
    returnFocusRef.current = null;
    if (el?.isConnected) el.focus({ preventScroll: true });
  }, [mounted]);

  if (!mounted) return null;

  return (
    <dialog
      ref={ref}
      id={ctx.contentId}
      aria-modal="true"
      aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
      aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
      data-state={state}
      data-side={side}
      className={cn('ui-sheet', size !== 'md' && `ui-sheet-${size}`, mobileFull && 'ui-sheet-mobile-full', className)}
      onCancel={(e) => {
        onCancel?.(e);
        // Esc: animate out instead of the browser's instant close
        e.preventDefault();
        if (dismissible) close();
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        onClick?.(e);
        // The <dialog> fills the viewport; a click on it (not the panel) is an overlay click
        if (dismissible && downOnBackdrop.current && e.target === e.currentTarget) close();
        downOnBackdrop.current = false;
      }}
      onClose={() => {
        // Closed natively (e.g. <form method="dialog">) — keep state in sync
        if (ctx.open) close();
      }}
      {...props}
    >
      {ready && (
        <div ref={panelRef} className={cn('ui-sheet-panel', panelClassName)} tabIndex={-1}>
          {draggable && <div className="ui-sheet-handle" aria-hidden="true" {...drag} />}
          {showClose && (
            <SheetClose className="ui-sheet-close" aria-label="Close">
              <Icon name="x" />
            </SheetClose>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
});

/* -------------------------------------------------------------------------- */

export interface SheetCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Closes the sheet. Wrap your own button with `asChild`. */
export const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(function SheetClose(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = useSheetContext('SheetClose');
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

/* -------------------------------------------------------------------------- */

export const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SheetHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sheet-header', className)} {...props} />;
});

export const SheetTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function SheetTitle(
  { className, ...props },
  ref,
) {
  const ctx = useSheetContext('SheetTitle');
  const { setHasTitle } = ctx;
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return <h2 ref={ref} id={ctx.titleId} className={cn('ui-sheet-title', className)} {...props} />;
});

export const SheetDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function SheetDescription({ className, ...props }, ref) {
    const ctx = useSheetContext('SheetDescription');
    const { setHasDescription } = ctx;
    useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return <p ref={ref} id={ctx.descriptionId} className={cn('ui-sheet-description', className)} {...props} />;
  },
);

/** Scrolls on its own when the content is taller than the sheet; header and footer stay put. */
export const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SheetBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sheet-body', className)} {...props} />;
});

export const SheetFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SheetFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sheet-footer', className)} {...props} />;
});
