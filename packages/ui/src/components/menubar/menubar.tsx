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
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
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
} from '../dropdown-menu/menu-context';

/* -------------------------------------------------------------------------- */

type Move = 'next' | 'prev' | 'first' | 'last';

interface MenubarContextValue {
  /** Value of the open menu, or null. */
  value: string | null;
  setMenuOpen: (menu: string, open: boolean) => void;
  tabStop: string | null;
  setTabStop: (menu: string) => void;
  /** Shared by every menu: only one is ever open. */
  openMethod: MutableRefObject<OpenMethod>;
  skipFocusReturn: MutableRefObject<boolean>;
  /** Move to another top-level trigger; when a menu is open it switches to that menu. */
  move: (from: HTMLElement | null, to: Move) => void;
  /** Open another menu because the pointer entered its trigger. */
  hoverSwitch: (menu: string) => void;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

function useMenubarContext(component: string) {
  const ctx = useContext(MenubarContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Menubar>.`);
  return ctx;
}

const MenubarMenuContext = createContext<string | null>(null);

const TRIGGERS = '[data-menubar-trigger]:not([disabled])';

export interface MenubarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /** Controlled: the value of the open menu (null for none). */
  value?: string | null;
  /** Initial open menu when uncontrolled. */
  defaultValue?: string | null;
  /** Called when the open menu changes. */
  onValueChange?: (value: string | null) => void;
}

/**
 * Menubar — a desktop-style bar of menus (WAI-ARIA menubar). Left / Right
 * move between menus (and switch the open one), Down opens, and once a menu
 * is open, hovering another title switches to it.
 */
export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { value: valueProp, defaultValue = null, onValueChange, className, ...props },
  forwardedRef,
) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const openMethod = useRef<OpenMethod>('pointer');
  const skipFocusReturn = useRef(false);
  const [tabStop, setTabStop] = useState<string | null>(null);

  // One tab stop for the whole bar: the first trigger until another one is focused
  useEffect(() => {
    if (tabStop !== null) return;
    const first = rootRef.current?.querySelector<HTMLElement>(TRIGGERS);
    if (first?.dataset.menuValue) setTabStop(first.dataset.menuValue);
  }, [tabStop]);

  const setMenuOpen = useCallback(
    (menu: string, open: boolean) => setValue((cur) => (open ? menu : cur === menu ? null : cur)),
    [setValue],
  );

  const move = useCallback(
    (from: HTMLElement | null, to: Move) => {
      const list = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(TRIGGERS) ?? []);
      if (!list.length) return;
      const i = from ? list.indexOf(from) : -1;
      const next =
        to === 'first'
          ? list[0]
          : to === 'last'
            ? list[list.length - 1]
            : list[(i + (to === 'next' ? 1 : -1) + list.length) % list.length];
      if (!next?.dataset.menuValue) return;
      setTabStop(next.dataset.menuValue);
      if (value !== null) {
        openMethod.current = 'keyboard';
        skipFocusReturn.current = true;
        setValue(next.dataset.menuValue);
      } else {
        next.focus();
      }
    },
    [value, setValue],
  );

  const hoverSwitch = useCallback(
    (menu: string) => {
      if (value === null || value === menu) return;
      openMethod.current = 'pointer';
      skipFocusReturn.current = true;
      setTabStop(menu);
      setValue(menu);
    },
    [value, setValue],
  );

  const ctx = useMemo(
    () => ({ value, setMenuOpen, tabStop, setTabStop, openMethod, skipFocusReturn, move, hoverSwitch }),
    [value, setMenuOpen, tabStop, move, hoverSwitch],
  );

  return (
    <MenubarContext.Provider value={ctx}>
      <div
        ref={ref}
        role="menubar"
        aria-orientation="horizontal"
        data-state={value !== null ? 'open' : 'closed'}
        className={cn('ui-menubar', className)}
        {...props}
      />
    </MenubarContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export interface MenubarMenuProps {
  /** Identifies the menu in the bar's `value`. Generated when omitted. */
  value?: string;
  children?: ReactNode;
}

/** One menu of the bar: a trigger and its content. */
export function MenubarMenu({ value, children }: MenubarMenuProps) {
  const bar = useMenubarContext('MenubarMenu');
  const id = useId();
  const menu = value ?? id;
  const triggerRef = useRef<HTMLElement | null>(null);
  const { setMenuOpen, openMethod, skipFocusReturn } = bar;
  const open = bar.value === menu;
  const setOpen = useCallback((next: boolean) => setMenuOpen(menu, next), [setMenuOpen, menu]);
  const closeMenu = useCallback(() => setMenuOpen(menu, false), [setMenuOpen, menu]);

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
    [open, setOpen, id, openMethod, skipFocusReturn, closeMenu],
  );

  return (
    <MenubarMenuContext.Provider value={menu}>
      <MenuRootContext.Provider value={root}>{children}</MenuRootContext.Provider>
    </MenubarMenuContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

export interface MenubarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** The menu title in the bar. */
export const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { className, onClick, onKeyDown, onFocus, onPointerEnter, ...props },
  forwardedRef,
) {
  const bar = useMenubarContext('MenubarTrigger');
  const root = useMenuRoot('MenubarTrigger');
  const menu = useContext(MenubarMenuContext) as string;
  const ref = useComposedRefs(forwardedRef, root.triggerRef as RefObject<HTMLButtonElement | null>);

  return (
    <button
      ref={ref}
      id={root.triggerId}
      type="button"
      role="menuitem"
      tabIndex={bar.tabStop === menu ? 0 : -1}
      aria-haspopup="menu"
      aria-expanded={root.open}
      aria-controls={root.open ? root.contentId : undefined}
      data-menubar-trigger=""
      data-menu-value={menu}
      data-state={root.open ? 'open' : 'closed'}
      className={cn('ui-menubar-trigger', className)}
      onFocus={(e: FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        bar.setTabStop(menu);
      }}
      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(e);
        if (e.pointerType !== 'touch') bar.hoverSwitch(menu);
      }}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        bar.setTabStop(menu);
        // detail 0 = activated from the keyboard (Enter / Space)
        root.openMethod.current = e.detail === 0 ? 'keyboard' : 'pointer';
        root.setOpen(!root.open);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        const el = e.currentTarget;
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            bar.move(el, 'next');
            return;
          case 'ArrowLeft':
            e.preventDefault();
            bar.move(el, 'prev');
            return;
          case 'Home':
            e.preventDefault();
            bar.move(el, 'first');
            return;
          case 'End':
            e.preventDefault();
            bar.move(el, 'last');
            return;
          case 'ArrowDown':
          case 'ArrowUp':
            e.preventDefault();
            root.openMethod.current = e.key === 'ArrowUp' ? 'keyboard-last' : 'keyboard';
            root.setOpen(true);
            return;
        }
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export type MenubarContentProps = Omit<
  FloatingContentProps,
  'open' | 'anchorRef' | 'arrow' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
>;

/** The menu panel under its title. */
export const MenubarContent = forwardRef<HTMLDivElement, MenubarContentProps>(function MenubarContent(
  { placement = 'bottom-start', offset = 6, className, children, onKeyDown, onPointerLeave, ...props },
  forwardedRef,
) {
  const bar = useMenubarContext('MenubarContent');
  const root = useMenuRoot('MenubarContent');
  const ownerId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, panelRef);
  const activeSub = useRef<ActiveSub | null>(null);
  const panel = useMemo(() => ({ ownerId, activeSub }), [ownerId]);
  const rove = useRovingFocus({ itemSelector: ownedItems(ownerId) });

  useDismiss(root.open, [panelRef, root.triggerRef], (reason) => {
    root.skipFocusReturn.current = reason === 'outside';
    root.setOpen(false);
  });

  return (
    <FloatingContent
      ref={ref}
      open={root.open}
      anchorRef={root.triggerRef}
      placement={placement}
      offset={offset}
      role="menu"
      id={root.contentId}
      tabIndex={-1}
      aria-orientation="vertical"
      aria-labelledby={root.triggerId}
      className={cn('ui-menu ui-menubar-content', className)}
      returnFocusRef={root.triggerRef}
      skipFocusReturnRef={root.skipFocusReturn}
      onOpened={(el) => {
        const method = root.openMethod.current;
        if (method === 'pointer') el.focus({ preventScroll: true });
        else focusItem(el, ownerId, method === 'keyboard-last' ? 'last' : 'first');
        root.openMethod.current = 'pointer';
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || !isOwnEvent(e)) return;
        if (e.key === 'Tab') {
          e.preventDefault();
          root.closeMenu();
          return;
        }
        // A submenu trigger consumes ArrowRight and a submenu ArrowLeft, so these are for the bar
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          bar.move(root.triggerRef.current, e.key === 'ArrowRight' ? 'next' : 'prev');
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
