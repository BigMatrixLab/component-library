'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../../lib/slot';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { FloatingContent, type FloatingContentProps } from '../popover/floating-content';
import {
  MenuPanelContext,
  MenuRootContext,
  focusItem,
  isOwnEvent,
  ownedItems,
  useMenuRoot,
  type ActiveSub,
  type OpenMethod,
} from './menu-context';

export interface DropdownMenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * DropdownMenu — a list of actions on a trigger (WAI-ARIA menu button).
 * Arrow keys, Home/End and typeahead move between items; Enter or Space
 * chooses; Esc closes and returns focus to the trigger.
 */
export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const openMethod = useRef<OpenMethod>('pointer');
  const skipFocusReturn = useRef(false);
  const closeMenu = useCallback(() => setOpen(false), [setOpen]);
  const value = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      openMethod,
      skipFocusReturn,
      closeMenu,
    }),
    [open, setOpen, id, closeMenu],
  );
  return <MenuRootContext.Provider value={value}>{children}</MenuRootContext.Provider>;
}

/* -------------------------------------------------------------------------- */

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Opens the menu. Use `asChild` to make your own <Button> the trigger. */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(function DropdownMenuTrigger(
  { asChild, onClick, onKeyDown, ...props },
  ref,
) {
  const ctx = useMenuRoot('DropdownMenuTrigger');
  const composed = useComposedRefs(ref, ctx.triggerRef as RefObject<HTMLButtonElement | null>);
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={composed}
      id={ctx.triggerId}
      type={asChild ? undefined : 'button'}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // detail 0 = activated from the keyboard (Enter / Space)
        ctx.openMethod.current = e.detail === 0 ? 'keyboard' : 'pointer';
        ctx.setOpen(!ctx.open);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          ctx.openMethod.current = e.key === 'ArrowUp' ? 'keyboard-last' : 'keyboard';
          ctx.setOpen(true);
        }
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export type DropdownMenuContentProps = Omit<
  FloatingContentProps,
  'open' | 'anchorRef' | 'arrow' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
>;

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { placement = 'bottom-start', offset = 6, className, children, onKeyDown, onPointerLeave, ...props },
  forwardedRef,
) {
  const ctx = useMenuRoot('DropdownMenuContent');
  const ownerId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);
  const activeSub = useRef<ActiveSub | null>(null);
  const panel = useMemo(() => ({ ownerId, activeSub }), [ownerId]);
  const rove = useRovingFocus({ itemSelector: ownedItems(ownerId) });

  useDismiss(ctx.open, [panelRef, ctx.triggerRef], (reason) => {
    ctx.skipFocusReturn.current = reason === 'outside';
    ctx.setOpen(false);
  });

  return (
    <FloatingContent
      ref={ref}
      open={ctx.open}
      anchorRef={ctx.triggerRef}
      placement={placement}
      offset={offset}
      role="menu"
      id={ctx.contentId}
      tabIndex={-1}
      aria-orientation="vertical"
      aria-labelledby={ctx.triggerRef.current?.id || ctx.triggerId}
      className={cn('ui-menu', className)}
      returnFocusRef={ctx.triggerRef}
      skipFocusReturnRef={ctx.skipFocusReturn}
      onOpened={(el) => {
        const method = ctx.openMethod.current;
        if (method === 'pointer') el.focus({ preventScroll: true });
        else focusItem(el, ownerId, method === 'keyboard-last' ? 'last' : 'first');
        // A programmatic open (defaultOpen, controlled) has no gesture: stay on the panel next time
        ctx.openMethod.current = 'pointer';
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || !isOwnEvent(e)) return;
        if (e.key === 'Tab') {
          // A menu is one tab stop: Tab closes it and returns focus to the trigger
          e.preventDefault();
          ctx.closeMenu();
          return;
        }
        rove(e);
      }}
      onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(e);
        // The highlight follows the pointer, so it clears when the pointer leaves
        const active = document.activeElement as HTMLElement | null;
        if (e.pointerType !== 'touch' && !activeSub.current && active?.dataset.menuOwner === ownerId) {
          e.currentTarget.focus({ preventScroll: true });
        }
      }}
      {...props}
    >
      <MenuPanelContext.Provider value={panel}>{children}</MenuPanelContext.Provider>
    </FloatingContent>
  );
});
