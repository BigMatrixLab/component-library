'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
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
import { useHoverIntent } from '../../hooks/use-hover-intent';
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
} from '../dropdown-menu/menu-context';

/* -------------------------------------------------------------------------- */

type PointAnchor = { getBoundingClientRect(): DOMRect };

interface ContextMenuContextValue {
  /** Virtual anchor: a zero-size rect at the pointer. */
  anchorRef: RefObject<PointAnchor | null>;
  openAt: (x: number, y: number, method: OpenMethod) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string) {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <ContextMenu>.`);
  return ctx;
}

export interface ContextMenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * ContextMenu — a menu of actions at the pointer. Right-click, long-press on
 * touch, or Shift+F10 / the ContextMenu key from keyboard focus. Same menu
 * pattern, parts and keyboard as the DropdownMenu.
 */
export function ContextMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: ContextMenuProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const openMethod = useRef<OpenMethod>('pointer');
  const skipFocusReturn = useRef(false);
  const point = useRef({ x: 0, y: 0 });
  const anchorRef = useRef<PointAnchor | null>({
    getBoundingClientRect: () => new DOMRect(point.current.x, point.current.y, 0, 0),
  });
  const closeMenu = useCallback(() => setOpen(false), [setOpen]);

  const openAt = useCallback(
    (x: number, y: number, method: OpenMethod) => {
      point.current = { x, y };
      openMethod.current = method;
      setOpen(true);
    },
    [setOpen],
  );

  const root = useMemo(
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
  const own = useMemo(() => ({ anchorRef, openAt }), [openAt]);

  return (
    <ContextMenuContext.Provider value={own}>
      <MenuRootContext.Provider value={root}>{children}</MenuRootContext.Provider>
    </ContextMenuContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 10;

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  /** Render the child element as the area instead of a wrapping <div>. */
  asChild?: boolean;
  /** Turn the custom menu off: the browser's own context menu shows. */
  disabled?: boolean;
  /** Touch long-press time, ms. Default 500. */
  longPressDelay?: number;
}

/**
 * The area that owns the menu. It is focusable (tabIndex 0) so keyboard users
 * can open the menu with Shift+F10 / the ContextMenu key; pass `tabIndex={-1}`
 * or `asChild` on an element that is already focusable to change that.
 */
export const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerProps>(function ContextMenuTrigger(
  {
    asChild,
    disabled,
    longPressDelay = LONG_PRESS_MS,
    className,
    tabIndex,
    onContextMenu,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    ...props
  },
  forwardedRef,
) {
  const root = useMenuRoot('ContextMenuTrigger');
  const cm = useContextMenuContext('ContextMenuTrigger');
  const ref = useComposedRefs(forwardedRef, root.triggerRef as RefObject<HTMLDivElement | null>);
  const press = useHoverIntent();
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastKeyOpen = useRef(0);
  const Comp = asChild ? Slot : 'div';

  const openFromKeyboard = (target: Element) => {
    const rect = target.getBoundingClientRect();
    lastKeyOpen.current = Date.now();
    cm.openAt(rect.left + Math.min(16, rect.width / 2), rect.bottom, 'keyboard');
  };

  return (
    <Comp
      ref={ref}
      tabIndex={tabIndex ?? (asChild ? undefined : 0)}
      data-state={root.open ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
      className={cn('ui-context-menu-trigger', className)}
      onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
        onContextMenu?.(e);
        if (e.defaultPrevented || disabled) return;
        e.preventDefault();
        press.cancel();
        // The keydown already opened the menu; the browser's follow-up event must not move it
        if (Date.now() - lastKeyOpen.current < 400) return;
        cm.openAt(e.clientX, e.clientY, 'pointer');
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || disabled) return;
        if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
          e.preventDefault();
          openFromKeyboard(e.target as Element);
        }
      }}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(e);
        if (e.defaultPrevented || disabled || e.pointerType === 'mouse') return;
        // Touch and pen: a long press is the right-click
        const { clientX: x, clientY: y } = e;
        start.current = { x, y };
        press.start(() => cm.openAt(x, y, 'pointer'), longPressDelay);
      }}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(e);
        const s = start.current;
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > LONG_PRESS_SLOP) press.cancel();
      }}
      onPointerUp={(e: PointerEvent<HTMLDivElement>) => {
        onPointerUp?.(e);
        press.cancel();
      }}
      onPointerCancel={(e: PointerEvent<HTMLDivElement>) => {
        onPointerCancel?.(e);
        press.cancel();
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export type ContextMenuContentProps = Omit<
  FloatingContentProps,
  'open' | 'anchorRef' | 'arrow' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
>;

/** The menu panel. Opens at the pointer, flips and shifts to stay on screen. */
export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  { placement = 'bottom-start', offset = 2, className, children, onKeyDown, onPointerLeave, onContextMenu, ...props },
  forwardedRef,
) {
  const root = useMenuRoot('ContextMenuContent');
  const cm = useContextMenuContext('ContextMenuContent');
  const ownerId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);
  const activeSub = useRef<ActiveSub | null>(null);
  const panel = useMemo(() => ({ ownerId, activeSub }), [ownerId]);
  const rove = useRovingFocus({ itemSelector: ownedItems(ownerId) });

  // The trigger area is not exempt: a right-click on it closes this menu, then opens a fresh one
  useDismiss(root.open, [panelRef], (reason) => {
    root.skipFocusReturn.current = reason === 'outside';
    root.setOpen(false);
  });

  return (
    <FloatingContent
      ref={ref}
      open={root.open}
      anchorRef={cm.anchorRef}
      placement={placement}
      offset={offset}
      role="menu"
      id={root.contentId}
      tabIndex={-1}
      aria-orientation="vertical"
      aria-label="Context menu"
      className={cn('ui-menu ui-context-menu', className)}
      returnFocusRef={root.triggerRef}
      skipFocusReturnRef={root.skipFocusReturn}
      onOpened={(el) => {
        const method = root.openMethod.current;
        if (method === 'pointer') el.focus({ preventScroll: true });
        else focusItem(el, ownerId, method === 'keyboard-last' ? 'last' : 'first');
        root.openMethod.current = 'pointer';
      }}
      onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
        onContextMenu?.(e);
        e.preventDefault();
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || !isOwnEvent(e)) return;
        if (e.key === 'Tab') {
          e.preventDefault();
          root.closeMenu();
          return;
        }
        rove(e);
      }}
      onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(e);
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
