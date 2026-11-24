'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';
import { Button } from '../button';
import { Sheet, SheetContent, SheetTitle } from '../sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
import { SidebarContext, useSidebar, type SidebarCollapsible, type SidebarSide } from './sidebar-context';

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled desktop state: true = expanded, false = collapsed to the rail. */
  open?: boolean;
  /** Initial state when uncontrolled. Default true. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * localStorage key that remembers the state between visits, or `false` to
   * turn it off. Reading and writing are wrapped in try/catch, so blocked
   * storage never throws. Default `"ui-sidebar"`.
   */
  storageKey?: string | false;
  /** Ctrl/Cmd + B toggles the sidebar. Default true. Turn off when several sidebars share a page. */
  shortcut?: boolean;
  /** Below this viewport width (px) the sidebar becomes an off-canvas sheet. Default 768. */
  mobileBreakpoint?: number;
  /** Lay out inside a fixed-height frame (a docs preview, a card) instead of the full page. */
  framed?: boolean;
}

/**
 * SidebarProvider — holds the open / collapsed state for Sidebar, SidebarTrigger
 * and every menu button, and lays out the sidebar next to SidebarInset.
 */
export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(function SidebarProvider(
  {
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    storageKey = 'ui-sidebar',
    shortcut = true,
    mobileBreakpoint = 768,
    framed,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const key = storageKey === false ? null : storageKey;
  const handleChange = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (!key) return;
      try {
        localStorage.setItem(key, next ? 'open' : 'collapsed');
      } catch {
        /* storage blocked: the state just won't persist */
      }
    },
    [onOpenChange, key],
  );
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: handleChange });
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Restore the remembered state before paint, then switch the width transition on
  useIsomorphicLayoutEffect(() => {
    if (!key || openProp !== undefined) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'open' || stored === 'collapsed') setOpen(stored === 'open');
    } catch {
      /* ignore */
    }
  }, [key]);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const read = () => setIsMobile(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, [mobileBreakpoint]);

  const toggle = useCallback(() => {
    if (isMobile) setOpenMobile((o) => !o);
    else setOpen((o) => !o);
  }, [isMobile, setOpen]);
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'b') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      e.preventDefault();
      toggleRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const ctx = useMemo(
    () => ({ open, setOpen, openMobile, setOpenMobile, isMobile, collapsed: !isMobile && !open, toggle }),
    [open, setOpen, openMobile, isMobile, toggle],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      <TooltipProvider delayDuration={250}>
        <div
          ref={ref}
          data-state={open ? 'expanded' : 'collapsed'}
          data-framed={framed ? '' : undefined}
          data-animate={animate ? '' : undefined}
          className={cn('ui-sidebar-wrapper', className)}
          style={style as CSSProperties}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Edge it sits on. Default `left`. */
  side?: SidebarSide;
  /**
   * `icon` collapses to a 56px rail of icons (default), `offcanvas` slides
   * away completely, `none` never collapses on desktop.
   */
  collapsible?: SidebarCollapsible;
}

/**
 * Sidebar — the app navigation column. On desktop it collapses to an icon rail
 * (the width animates on the smooth spring); below the mobile breakpoint it is
 * an off-canvas Sheet.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { side = 'left', collapsible = 'icon', className, children, ...props },
  ref,
) {
  const parent = useSidebar();
  const collapsed = parent.collapsed && collapsible !== 'none';
  const value = useMemo(() => ({ ...parent, collapsed }), [parent, collapsed]);

  if (parent.isMobile) {
    return (
      <SidebarContext.Provider value={value}>
        <Sheet open={parent.openMobile} onOpenChange={parent.setOpenMobile}>
          <SheetContent
            side={side}
            size="sm"
            showClose={false}
            className="ui-sidebar-sheet"
            panelClassName="ui-sidebar-sheet-panel"
          >
            <SheetTitle className="sr-only">{props['aria-label'] ?? 'Sidebar'}</SheetTitle>
            <div ref={ref as never} data-mobile="" className={cn('ui-sidebar-inner', className)}>
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={value}>
      <aside
        ref={ref}
        aria-label="Sidebar"
        data-side={side}
        data-collapsible={collapsible}
        data-state={collapsed ? 'collapsed' : 'expanded'}
        className={cn('ui-sidebar', className)}
        {...props}
      >
        <div className="ui-sidebar-inner">{children}</div>
      </aside>
    </SidebarContext.Provider>
  );
});

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sidebar-header', className)} {...props} />;
});

/** The scrolling middle of the sidebar. */
export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sidebar-content', className)} {...props} />;
});

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sidebar-footer', className)} {...props} />;
});

export const SidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-sidebar-group', className)} {...props} />;
});

export interface SidebarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** A small heading above a group. Fades out when the sidebar is collapsed. */
export const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(function SidebarGroupLabel(
  { asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp ref={ref as never} className={cn('ui-sidebar-group-label', className)} {...props} />;
});

export interface SidebarInsetProps extends HTMLAttributes<HTMLElement> {
  /** Render your own element, e.g. `<SidebarInset asChild><main>…</main></SidebarInset>`. */
  asChild?: boolean;
}

/** The main area next to the sidebar. Scrolls on its own inside a framed provider. */
export const SidebarInset = forwardRef<HTMLElement, SidebarInsetProps>(function SidebarInset(
  { asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp ref={ref as never} className={cn('ui-sidebar-inset', className)} {...props} />;
});

/** The button that collapses / expands the sidebar (opens the sheet on mobile). */
export const SidebarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SidebarTrigger({ className, onClick, children, ...props }, ref) {
    const { toggle, open, openMobile, isMobile } = useSidebar();
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="sm"
            icon
            aria-label="Toggle sidebar"
            aria-expanded={isMobile ? openMobile : open}
            className={cn('ui-sidebar-trigger', className)}
            onClick={(e) => {
              onClick?.(e);
              if (!e.defaultPrevented) toggle();
            }}
            {...props}
          >
            {children ?? <Icon name="panel-left" size={18} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent shortcut="Ctrl B">Toggle sidebar</TooltipContent>
      </Tooltip>
    );
  },
);
