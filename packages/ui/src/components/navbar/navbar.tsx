'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIndicator } from '../../hooks/use-indicator';
import { useScrolled } from '../../hooks/use-scrolled';
import { Icon } from '../../icons/icon';
import { Button } from '../button';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger, type SheetSide } from '../sheet';

interface NavbarContextValue {
  closeMobile: () => void;
}

const NavbarContext = createContext<NavbarContextValue>({ closeMobile: () => {} });

export type NavbarVariant = 'default' | 'floating';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** `default` spans the width with a bottom border; `floating` is a pill that hovers above the page. */
  variant?: NavbarVariant;
  /** Stick to the top of the scroll container. Default true. */
  sticky?: boolean;
  /**
   * Changes on every navigation (pass `usePathname()` from Next.js). The mobile
   * menu closes when it changes. Back/forward and hash changes close it too.
   */
  routeKey?: string;
  /** Controlled state of the mobile menu. */
  mobileOpen?: boolean;
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

/**
 * Navbar — a sticky site header with a blurred backdrop. The bottom border
 * appears once the page scrolls. Below 768px of its own width the links
 * collapse into a menu inside a Sheet (see NavbarMobileToggle / NavbarMobileMenu).
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  {
    variant = 'default',
    sticky = true,
    routeKey,
    mobileOpen: mobileOpenProp,
    defaultMobileOpen = false,
    onMobileOpenChange,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const ref = useRef<HTMLElement | null>(null);
  const composed = useComposedRefs(forwardedRef, ref);
  const scrolled = useScrolled(ref);
  const [mobileOpen, setMobileOpen] = useControllableState({
    value: mobileOpenProp,
    defaultValue: defaultMobileOpen,
    onChange: onMobileOpenChange,
  });
  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  // Close the mobile menu on route change (skip the first run)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    closeMobile();
  }, [routeKey, closeMobile]);
  useEffect(() => {
    window.addEventListener('popstate', closeMobile);
    window.addEventListener('hashchange', closeMobile);
    return () => {
      window.removeEventListener('popstate', closeMobile);
      window.removeEventListener('hashchange', closeMobile);
    };
  }, [closeMobile]);

  const ctx = useMemo(() => ({ closeMobile }), [closeMobile]);

  return (
    <NavbarContext.Provider value={ctx}>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <header
          ref={composed}
          data-variant={variant}
          data-sticky={sticky ? '' : undefined}
          data-scrolled={scrolled ? '' : undefined}
          className={cn('ui-navbar', className)}
          {...props}
        >
          <div className="ui-navbar-inner">{children}</div>
        </header>
      </Sheet>
    </NavbarContext.Provider>
  );
});

export interface NavbarBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child element (e.g. a Next.js `<Link>`). */
  asChild?: boolean;
}

/** Logo and name. A link to the home page. */
export const NavbarBrand = forwardRef<HTMLAnchorElement, NavbarBrandProps>(function NavbarBrand(
  { asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  return <Comp ref={ref as never} className={cn('ui-navbar-brand', className)} {...props} />;
});

export interface NavbarNavProps extends HTMLAttributes<HTMLElement> {
  /** Highlight for the active link: a soft `pill` (default) or an `underline` on the navbar edge. */
  indicator?: 'pill' | 'underline';
}

/**
 * The main links. One highlight glides to whichever child has
 * `aria-current="page"` (set it with NavbarLink `active`).
 */
export const NavbarNav = forwardRef<HTMLElement, NavbarNavProps>(function NavbarNav(
  { indicator = 'pill', className, children, ...props },
  forwardedRef,
) {
  const ref = useRef<HTMLElement | null>(null);
  const composed = useComposedRefs(forwardedRef, ref);
  // Re-measure whenever the active link changes (a link elsewhere sets aria-current)
  const [key, setKey] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => setKey((k) => k + 1));
    observer.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current'] });
    return () => observer.disconnect();
  }, []);
  useIndicator(ref, '[aria-current="page"]', key);
  return (
    <nav ref={composed} aria-label="Main" data-indicator={indicator} className={cn('ui-navbar-nav', className)} {...props}>
      {children}
      <span className="ui-navbar-indicator" aria-hidden="true" />
    </nav>
  );
});

export interface NavbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** This link is the current page: `aria-current="page"` and the gliding highlight. */
  active?: boolean;
  /** Render the child element (e.g. a Next.js `<Link>`) with the link styles. */
  asChild?: boolean;
}

export const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(function NavbarLink(
  { active, asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref as never}
      aria-current={active ? 'page' : undefined}
      className={cn('ui-navbar-link', className)}
      {...props}
    />
  );
});

/** Buttons and links on the right: search, sign in, the main call to action. */
export const NavbarActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function NavbarActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-navbar-actions', className)} {...props} />;
});

/** The menu button shown when the navbar is narrow. Opens the mobile menu. */
export const NavbarMobileToggle = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavbarMobileToggle({ className, ...props }, ref) {
    return (
      <SheetTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          icon
          aria-label="Open menu"
          className={cn('ui-navbar-toggle', className)}
          {...props}
        >
          <Icon name="menu" size={18} />
        </Button>
      </SheetTrigger>
    );
  },
);

export interface NavbarMobileMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading of the sheet (read by screen readers). Default "Menu". */
  title?: ReactNode;
  /** Edge the menu slides in from. Default `right`. */
  side?: SheetSide;
}

/**
 * The menu that opens from NavbarMobileToggle, inside a Sheet. Put NavbarLinks
 * (and buttons) in it. It closes when a link inside is clicked.
 */
export const NavbarMobileMenu = forwardRef<HTMLDivElement, NavbarMobileMenuProps>(function NavbarMobileMenu(
  { title = 'Menu', side = 'right', className, children, onClick, ...props },
  ref,
) {
  const { closeMobile } = useContext(NavbarContext);
  return (
    <SheetContent side={side} size="sm" className="ui-navbar-sheet" panelClassName="ui-navbar-mobile">
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      <SheetBody>
        <nav
          ref={ref as never}
          aria-label="Mobile"
          className={cn('ui-navbar-mobile-nav', className)}
          onClick={(e: MouseEvent<HTMLElement>) => {
            onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
            if (!e.defaultPrevented && (e.target as HTMLElement).closest('a[href]')) closeMobile();
          }}
          {...(props as HTMLAttributes<HTMLElement>)}
        >
          {children}
        </nav>
      </SheetBody>
    </SheetContent>
  );
});
