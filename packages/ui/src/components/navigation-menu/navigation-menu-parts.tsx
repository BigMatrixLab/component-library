'use client';

import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type LiHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useComposedRefs } from '../../lib/compose-refs';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { usePresence } from '../../hooks/use-presence';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { Icon } from '../../icons/icon';
import {
  FOCUSABLE,
  NavigationMenuInContentContext,
  NavigationMenuItemContext,
  useNavigationMenu,
  useNavigationMenuItem,
} from './navigation-menu-context';

/** The row of triggers and links. Left / Right (Up / Down in the accordion) move between them. */
export const NavigationMenuList = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function NavigationMenuList({ className, onKeyDown, ...props }, ref) {
    const ctx = useNavigationMenu('NavigationMenuList');
    const { mode, value, select, close } = ctx;
    const rove = useRovingFocus({
      itemSelector: '.ui-nav-menu-trigger, .ui-nav-menu-link:not([data-in-content])',
      orientation: mode === 'menu' ? 'horizontal' : 'vertical',
      typeahead: false,
      onMove: (item) => {
        // While a panel is open, moving along the bar switches it (or closes it on a plain link)
        if (mode !== 'menu' || !value) return;
        const next = item.getAttribute('data-nav-value');
        if (next) select(next, 'keyboard');
        else close();
      },
    });
    return (
      <ul
        ref={ref}
        data-orientation={mode === 'menu' ? 'horizontal' : 'vertical'}
        className={cn('ui-nav-menu-list', className)}
        onKeyDown={(e: KeyboardEvent<HTMLUListElement>) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) rove(e);
        }}
        {...props}
      />
    );
  },
);

export interface NavigationMenuItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Identifies the item (which one is open). Defaults to a generated id. */
  value?: string;
}

/** One entry: either a trigger with content, or a plain link. */
export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(function NavigationMenuItem(
  { value: valueProp, className, ...props },
  ref,
) {
  const auto = useId();
  const value = valueProp ?? auto;
  const ctx = useMemo(
    () => ({ value, triggerId: `${auto}-trigger`, contentId: `${auto}-content` }),
    [value, auto],
  );
  return (
    <NavigationMenuItemContext.Provider value={ctx}>
      <li ref={ref} className={cn('ui-nav-menu-item', className)} {...props} />
    </NavigationMenuItemContext.Provider>
  );
});

/**
 * The button that opens an item's panel: hover (with intent delay), click, or
 * Down arrow. Enter / Space toggle it; Down or Tab moves into the panel.
 */
export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavigationMenuTrigger(
    { className, children, onClick, onKeyDown, onPointerEnter, ...props },
    forwardedRef,
  ) {
    const ctx = useNavigationMenu('NavigationMenuTrigger');
    const item = useNavigationMenuItem('NavigationMenuTrigger');
    const elRef = useRef<HTMLButtonElement | null>(null);
    const ref = useComposedRefs(forwardedRef, elRef);
    const open = ctx.value === item.value;
    const { triggers } = ctx;

    useIsomorphicLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      triggers.current.set(item.value, el);
      return () => {
        triggers.current.delete(item.value);
      };
    }, [item.value, triggers]);

    return (
      <button
        ref={ref}
        id={item.triggerId}
        type="button"
        data-nav-value={item.value}
        data-state={open ? 'open' : 'closed'}
        aria-expanded={open}
        aria-controls={ctx.mode === 'accordion' || open ? item.contentId : undefined}
        className={cn('ui-nav-menu-trigger', className)}
        onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
          onPointerEnter?.(e);
          if (e.pointerType === 'mouse') ctx.hoverIn(item.value);
        }}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          if (ctx.mode === 'accordion') {
            ctx.select(open ? '' : item.value, 'click');
          } else if (open) {
            // A click right after hovering it open keeps it open; the next click closes
            if (ctx.hoverOpened.current) ctx.hoverOpened.current = false;
            else ctx.close();
          } else {
            ctx.select(item.value, 'click');
          }
        }}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || ctx.mode !== 'menu') return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (open) ctx.focusContent();
            else {
              ctx.focusOnOpen.current = true;
              ctx.select(item.value, 'keyboard');
            }
          } else if (e.key === 'Tab' && !e.shiftKey && open) {
            e.preventDefault();
            ctx.focusContent();
          }
        }}
        {...props}
      >
        {children}
        <Icon name="chevron-down" size={14} className="ui-nav-menu-chevron" />
      </button>
    );
  },
);

/**
 * The panel content of an item. In menu mode it is portaled into the shared
 * floating panel (so the panel resizes between items and the content slides
 * in from the side of travel); in accordion mode it expands in place.
 */
export const NavigationMenuContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function NavigationMenuContent({ className, children, ...props }, forwardedRef) {
    const ctx = useNavigationMenu('NavigationMenuContent');
    const item = useNavigationMenuItem('NavigationMenuContent');
    const open = ctx.value === item.value;
    // On a full close the last content stays while the panel fades out
    const keep = ctx.value === '' ? ctx.lastValue === item.value : open;
    const { mounted, ref: presenceRef } = usePresence<HTMLDivElement>(keep);
    const ref = useComposedRefs(forwardedRef, presenceRef);
    const { focusOnOpen, slot, mode } = ctx;

    // Opened with the keyboard: move focus to the first link once the content is in
    useEffect(() => {
      if (mode !== 'menu' || !open || !mounted || !slot || !focusOnOpen.current) return;
      focusOnOpen.current = false;
      presenceRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, [mode, open, mounted, slot, focusOnOpen, presenceRef]);

    if (mode === 'accordion') {
      return (
        <div
          id={item.contentId}
          data-state={open ? 'open' : 'closed'}
          className="ui-nav-menu-accordion"
        >
          <div className="ui-nav-menu-accordion-inner">
            <NavigationMenuInContentContext.Provider value>
              <div ref={ref} className={cn('ui-nav-menu-content', className)} {...props}>
                {children}
              </div>
            </NavigationMenuInContentContext.Provider>
          </div>
        </div>
      );
    }

    if (!slot || !mounted) return null;
    const motion = ctx.direction
      ? open
        ? `from-${ctx.direction}`
        : `to-${ctx.direction === 'end' ? 'start' : 'end'}`
      : undefined;
    return createPortal(
      <NavigationMenuInContentContext.Provider value>
        <div
          ref={ref}
          id={item.contentId}
          data-state={open ? 'open' : 'closed'}
          data-motion={motion}
          className={cn('ui-nav-menu-content', className)}
          {...props}
        >
          {children}
        </div>
      </NavigationMenuInContentContext.Provider>,
      slot,
    );
  },
);

export interface NavigationMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The current page: `aria-current="page"`. */
  active?: boolean;
  /** Render the child element (e.g. a Next.js `<Link>`). */
  asChild?: boolean;
}

/** A link, in the bar or inside a panel. Following one closes the panel. */
export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(function NavigationMenuLink(
  { active, asChild, className, onClick, onPointerEnter, ...props },
  ref,
) {
  const ctx = useNavigationMenu('NavigationMenuLink');
  const inContent = useContext(NavigationMenuInContentContext);
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref as never}
      data-in-content={inContent ? '' : undefined}
      data-active={active ? '' : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn('ui-nav-menu-link', className)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (ctx.mode === 'menu') ctx.close();
      }}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(e);
        // Moving from an open trigger onto a plain link lets the panel go
        if (!inContent && e.pointerType === 'mouse') ctx.hoverElsewhere();
      }}
      {...props}
    />
  );
});

/** Bold first line of a rich panel link. */
export const NavigationMenuLinkTitle = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function NavigationMenuLinkTitle({ className, ...props }, ref) {
    return <span ref={ref} className={cn('ui-nav-menu-link-title', className)} {...props} />;
  },
);

/** Muted supporting line of a rich panel link. */
export const NavigationMenuLinkDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function NavigationMenuLinkDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn('ui-nav-menu-link-description', className)} {...props} />;
  },
);
