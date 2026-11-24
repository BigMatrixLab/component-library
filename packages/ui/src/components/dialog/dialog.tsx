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
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { usePresence } from '../../hooks/use-presence';
import { useScrollLock } from '../../hooks/use-scroll-lock';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';

/* -------------------------------------------------------------------------- */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (v: boolean) => void;
  setHasDescription: (v: boolean) => void;
  /** The trigger, so focus can return to it (Safari/Firefox don't focus buttons on click). */
  triggerRef: RefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Dialog>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the dialog asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Dialog — a modal surface for decisions that need attention.
 * Built on native <dialog>: top layer, focus containment and an inert page
 * come from the browser.
 */
export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  return (
    <DialogContext.Provider
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
    </DialogContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Opens the dialog. Use `asChild` to make your own <Button> the trigger. */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = useDialogContext('DialogTrigger');
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

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogContentProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  /** Panel width: 384 / 512 / 672 / 896px or full. Default `md`. */
  size?: DialogSize;
  /** Close on Esc and backdrop click. Set false for alert dialogs. Default true. */
  dismissible?: boolean;
  /** Show the × button in the corner. Default true. */
  showClose?: boolean;
  /** Keep the dialog centred on phones instead of docking to the bottom. */
  centered?: boolean;
  /** Class for the inner panel (the card). `className` styles the overlay layer. */
  panelClassName?: string;
  /** ARIA role. Use `alertdialog` for confirmations. Default `dialog`. */
  role?: 'dialog' | 'alertdialog';
}

export const DialogContent = forwardRef<HTMLDialogElement, DialogContentProps>(function DialogContent(
  {
    size = 'md',
    dismissible = true,
    showClose = true,
    centered = false,
    className,
    panelClassName,
    role = 'dialog',
    children,
    onCancel,
    onClick,
    onPointerDown,
    ...props
  },
  forwardedRef,
) {
  const ctx = useDialogContext('DialogContent');
  const { mounted, state, ref: presenceRef } = usePresence<HTMLDialogElement>(ctx.open);
  const ref = useComposedRefs(forwardedRef, presenceRef);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const downOnBackdrop = useRef(false);
  // The panel mounts only after showModal(), so React's `autoFocus` (which runs
  // when an element mounts) lands on a visible element inside the open dialog.
  const [ready, setReady] = useState(false);
  useScrollLock(ctx.open);

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

  // 3. After the exit animation unmounts the dialog, give focus back.
  useEffect(() => {
    if (mounted) return;
    setReady(false);
    const el = returnFocusRef.current;
    returnFocusRef.current = null;
    if (el?.isConnected) el.focus({ preventScroll: true });
  }, [mounted]);

  const close = useCallback(() => ctx.setOpen(false), [ctx]);

  if (!mounted) return null;

  return (
    <dialog
      ref={ref}
      id={ctx.contentId}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
      aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
      data-state={state}
      className={cn(
        'ui-dialog',
        size !== 'md' && `ui-dialog-${size}`,
        centered && 'ui-dialog-center',
        className,
      )}
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
        // The <dialog> fills the viewport; a click on it (not the panel) is a backdrop click
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
        <div ref={panelRef} className={cn('ui-dialog-panel', panelClassName)} tabIndex={-1}>
          {showClose && (
            <DialogClose className="ui-dialog-close" aria-label="Close">
              <Icon name="x" />
            </DialogClose>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
});

/* -------------------------------------------------------------------------- */

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Closes the dialog. Wrap your own button with `asChild`. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = useDialogContext('DialogClose');
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

export const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-dialog-header', className)} {...props} />;
});

export const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function DialogTitle(
  { className, ...props },
  ref,
) {
  const ctx = useDialogContext('DialogTitle');
  const { setHasTitle } = ctx;
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return <h2 ref={ref} id={ctx.titleId} className={cn('ui-dialog-title', className)} {...props} />;
});

export const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function DialogDescription({ className, ...props }, ref) {
    const ctx = useDialogContext('DialogDescription');
    const { setHasDescription } = ctx;
    useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return <p ref={ref} id={ctx.descriptionId} className={cn('ui-dialog-description', className)} {...props} />;
  },
);

export const DialogBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-dialog-body', className)} {...props} />;
});

export const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-dialog-footer', className)} {...props} />;
});
