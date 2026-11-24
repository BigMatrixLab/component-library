'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
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
import { useHoverIntent } from '../../hooks/use-hover-intent';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { Icon } from '../../icons/icon';
import { FloatingContent, type FloatingContentProps } from '../popover/floating-content';
import {
  MenuPanelContext,
  focusItem,
  isOwnEvent,
  ownedItems,
  useMenuPanel,
  useMenuRoot,
  type ActiveSub,
  type OpenMethod,
} from './menu-context';
import { pointerMovedOverItem, useItemHighlight } from './menu-items';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 300;

interface SubContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  triggerId: string;
  contentId: string;
  openMethod: MutableRefObject<OpenMethod>;
  exit: MutableRefObject<{ x: number; y: number; t: number } | null>;
  intent: ReturnType<typeof useHoverIntent>;
}

const SubContext = createContext<SubContextValue | null>(null);

function useSub(component: string) {
  const ctx = useContext(SubContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenuSub>.`);
  return ctx;
}

export interface DropdownMenuSubProps {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/** A nested menu. Opens to the side on hover (short intent delay) or ArrowRight. */
export function DropdownMenuSub({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuSubProps) {
  const panel = useMenuPanel('DropdownMenuSub');
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const openMethod = useRef<OpenMethod>('pointer');
  const exit = useRef<SubContextValue['exit']['current']>(null);
  const intent = useHoverIntent();

  // Only one submenu is open per panel; the panel can close it when another item is hovered
  useEffect(() => {
    if (!open) return;
    const record: ActiveSub = {
      id,
      triggerEl: triggerRef.current,
      close: () => setOpen(false),
      getPanelRect: () => contentRef.current?.getBoundingClientRect() ?? null,
      getExit: () => exit.current,
    };
    const previous = panel.activeSub.current;
    if (previous && previous.id !== id) previous.close();
    panel.activeSub.current = record;
    return () => {
      if (panel.activeSub.current === record) panel.activeSub.current = null;
    };
  }, [open, id, panel, setOpen]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      openMethod,
      exit,
      intent,
    }),
    [open, setOpen, id, intent],
  );
  return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}

/* -------------------------------------------------------------------------- */

export interface DropdownMenuSubTriggerProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  /** Leading icon (16px). */
  icon?: ReactNode;
  inset?: boolean;
}

/** The item that opens a submenu; shows a chevron. */
export const DropdownMenuSubTrigger = forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  function DropdownMenuSubTrigger(
    {
      disabled,
      icon,
      inset,
      className,
      children,
      onPointerMove,
      onPointerLeave,
      onClick,
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef,
  ) {
    const sub = useSub('DropdownMenuSubTrigger');
    const panel = useMenuPanel('DropdownMenuSubTrigger');
    const highlight = useItemHighlight(disabled);
    const ref = useComposedRefs(forwardedRef, sub.triggerRef as RefObject<HTMLDivElement | null>);

    const openSub = (method: OpenMethod) => {
      sub.intent.cancel();
      sub.openMethod.current = method;
      sub.setOpen(true);
    };

    return (
      <div
        ref={ref}
        id={sub.triggerId}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={sub.open}
        aria-controls={sub.open ? sub.contentId : undefined}
        aria-disabled={disabled || undefined}
        data-menu-owner={panel.ownerId}
        data-state={sub.open ? 'open' : 'closed'}
        data-highlighted={highlight.highlighted ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        className={cn('ui-menu-item ui-menu-sub-trigger', inset && 'ui-menu-item-inset', className)}
        onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
          onPointerMove?.(e);
          if (e.defaultPrevented || disabled || e.pointerType === 'touch') return;
          if (pointerMovedOverItem(panel, e)) return;
          if (document.activeElement !== e.currentTarget) e.currentTarget.focus({ preventScroll: true });
          // Hover intent: open after a short pause, not on a fly-by
          if (sub.open) sub.intent.cancel();
          else sub.intent.start(() => openSub('pointer'), OPEN_DELAY);
        }}
        onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(e);
          if (disabled || e.pointerType === 'touch') return;
          sub.exit.current = { x: e.clientX, y: e.clientY, t: Date.now() };
          if (sub.open) sub.intent.start(() => sub.setOpen(false), CLOSE_DELAY);
          else sub.intent.cancel();
        }}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          onClick?.(e);
          if (e.defaultPrevented || disabled) return;
          if (!sub.open) openSub('pointer');
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || disabled) return;
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            openSub('keyboard');
          }
        }}
        onFocus={(e: FocusEvent<HTMLDivElement>) => {
          onFocus?.(e);
          highlight.onFocus();
        }}
        onBlur={(e: FocusEvent<HTMLDivElement>) => {
          onBlur?.(e);
          highlight.onBlur();
        }}
        {...props}
      >
        {icon != null && <span className="ui-menu-icon">{icon}</span>}
        {children}
        <Icon name="chevron-right" className="ui-menu-chevron" />
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */

export type DropdownMenuSubContentProps = Omit<
  FloatingContentProps,
  'open' | 'anchorRef' | 'arrow' | 'onOpened' | 'returnFocusRef' | 'skipFocusReturnRef'
>;

export const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent(
    { placement = 'right-start', offset = 4, className, children, onKeyDown, onPointerEnter, ...props },
    forwardedRef,
  ) {
    const sub = useSub('DropdownMenuSubContent');
    const root = useMenuRoot('DropdownMenuSubContent');
    const ownerId = useId();
    const ref = useComposedRefs(forwardedRef, sub.contentRef as RefObject<HTMLDivElement | null>);
    const activeSub = useRef<ActiveSub | null>(null);
    const panel = useMemo(() => ({ ownerId, activeSub }), [ownerId]);
    const rove = useRovingFocus({ itemSelector: ownedItems(ownerId) });

    return (
      <FloatingContent
        ref={ref}
        open={sub.open}
        anchorRef={sub.triggerRef}
        placement={placement}
        offset={offset}
        role="menu"
        id={sub.contentId}
        tabIndex={-1}
        aria-orientation="vertical"
        aria-labelledby={sub.triggerId}
        className={cn('ui-menu ui-menu-sub', className)}
        returnFocusRef={sub.triggerRef}
        onOpened={(el) => {
          if (sub.openMethod.current !== 'pointer') focusItem(el, ownerId, 'first');
          sub.openMethod.current = 'pointer';
        }}
        onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
          onPointerEnter?.(e);
          sub.intent.cancel();
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || !isOwnEvent(e)) return;
          if (e.key === 'ArrowLeft' || e.key === 'Escape') {
            // Close just this level; preventDefault keeps Esc from also closing the root menu
            e.preventDefault();
            sub.setOpen(false);
            sub.triggerRef.current?.focus({ preventScroll: true });
            return;
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            root.closeMenu();
            return;
          }
          rove(e);
        }}
        {...props}
      >
        <MenuPanelContext.Provider value={panel}>{children}</MenuPanelContext.Provider>
      </FloatingContent>
    );
  },
);
