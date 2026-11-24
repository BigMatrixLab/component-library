'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { useSidebar } from './sidebar-context';
import { SidebarTooltip } from './sidebar-menu';

interface SubContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
}

const SubContext = createContext<SubContextValue | null>(null);

function useSub(component: string) {
  const ctx = useContext(SubContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <SidebarMenuSub>.`);
  return ctx;
}

export interface SidebarMenuSubProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A collapsible group of nested items inside a SidebarMenuItem:
 *   <SidebarMenuSub><SidebarMenuSubTrigger>…</SidebarMenuSubTrigger>
 *     <SidebarMenuSubContent><SidebarMenuSubItem>…
 */
export const SidebarMenuSub = forwardRef<HTMLDivElement, SidebarMenuSubProps>(function SidebarMenuSub(
  { open: openProp, defaultOpen = false, onOpenChange, className, ...props },
  ref,
) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const ctx = useMemo(
    () => ({ open, setOpen, triggerId: `${id}-trigger`, contentId: `${id}-content` }),
    [open, setOpen, id],
  );
  return (
    <SubContext.Provider value={ctx}>
      <div ref={ref} data-state={open ? 'open' : 'closed'} className={cn('ui-sidebar-sub', className)} {...props} />
    </SubContext.Provider>
  );
});

export interface SidebarMenuSubTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The sub-menu holds the current page. */
  isActive?: boolean;
  /** Shown in a tooltip when the sidebar is collapsed to the rail. */
  tooltip?: ReactNode;
}

/** The row that opens and closes the nested items. Same look as SidebarMenuButton, plus a chevron. */
export const SidebarMenuSubTrigger = forwardRef<HTMLButtonElement, SidebarMenuSubTriggerProps>(
  function SidebarMenuSubTrigger({ isActive, tooltip, className, onClick, children, ...props }, ref) {
    const sub = useSub('SidebarMenuSubTrigger');
    const { collapsed, setOpen: setSidebarOpen } = useSidebar();
    const button = (
      <button
        ref={ref}
        type="button"
        id={sub.triggerId}
        data-size="default"
        data-active={isActive && !sub.open ? 'true' : undefined}
        data-state={sub.open ? 'open' : 'closed'}
        aria-expanded={sub.open}
        aria-controls={sub.contentId}
        className={cn('ui-sidebar-menu-button ui-sidebar-sub-trigger', className)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          // On the rail there is no room for nested items: expand the sidebar and show them
          if (collapsed) {
            setSidebarOpen(true);
            sub.setOpen(true);
          } else {
            sub.setOpen(!sub.open);
          }
        }}
        {...props}
      >
        {children}
        <Icon name="chevron-right" size={14} className="ui-sidebar-sub-chevron" />
      </button>
    );
    return tooltip != null ? <SidebarTooltip trigger={button} label={tooltip} /> : button;
  },
);

/** The nested items. Their height animates on the smooth spring; closed items are out of the tab order. */
export const SidebarMenuSubContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarMenuSubContent({ className, children, ...props }, ref) {
    const sub = useSub('SidebarMenuSubContent');
    return (
      <div
        ref={ref}
        id={sub.contentId}
        data-state={sub.open ? 'open' : 'closed'}
        className={cn('ui-sidebar-sub-content', className)}
        {...props}
      >
        <div className="ui-sidebar-sub-inner">
          <ul className="ui-sidebar-sub-list">{children}</ul>
        </div>
      </div>
    );
  },
);

export const SidebarMenuSubItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function SidebarMenuSubItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} className={cn('ui-sidebar-sub-item', className)} {...props} />;
});

export interface SidebarMenuSubButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
}

export const SidebarMenuSubButton = forwardRef<HTMLButtonElement, SidebarMenuSubButtonProps>(
  function SidebarMenuSubButton({ asChild, isActive, className, onClick, ...props }, ref) {
    const { isMobile, setOpenMobile } = useSidebar();
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : 'button'}
        data-active={isActive ? 'true' : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={cn('ui-sidebar-sub-button', className)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (isMobile && !e.defaultPrevented) setOpenMobile(false);
        }}
        {...props}
      />
    );
  },
);
