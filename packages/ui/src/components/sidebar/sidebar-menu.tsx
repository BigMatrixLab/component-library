'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';
import { useSidebar } from './sidebar-context';

export const SidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function SidebarMenu(
  { className, ...props },
  ref,
) {
  return <ul ref={ref} className={cn('ui-sidebar-menu', className)} {...props} />;
});

export const SidebarMenuItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function SidebarMenuItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} className={cn('ui-sidebar-menu-item', className)} {...props} />;
});

/**
 * Shows `label` in a tooltip to the right of `trigger`, but only while the
 * sidebar is collapsed. The tree shape never changes (so focus survives a
 * collapse); the tooltip is held closed when it is not wanted.
 */
export function SidebarTooltip({ trigger, label }: { trigger: ReactElement; label: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <Tooltip open={collapsed ? undefined : false}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      {collapsed && <TooltipContent placement="right" offset={10}>{label}</TooltipContent>}
    </Tooltip>
  );
}

export interface SidebarMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render your own element, e.g. a Next.js `<Link>`, with the button styles. */
  asChild?: boolean;
  /** The current page: highlighted, `aria-current="page"`. */
  isActive?: boolean;
  /** Shown in a tooltip when the sidebar is collapsed to the rail. Usually the label. */
  tooltip?: ReactNode;
  /** `lg` is 48px tall, for a workspace switcher or account row. */
  size?: 'default' | 'lg';
}

/**
 * One row: an icon and a label (and optionally a SidebarMenuBadge). Put the
 * icon first and the label in a `<span>`; the rail clips the label away.
 */
export const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(function SidebarMenuButton(
  { asChild, isActive, tooltip, size = 'default', className, onClick, children, ...props },
  ref,
) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Comp = asChild ? Slot : 'button';
  const button = (
    <Comp
      ref={ref as never}
      type={asChild ? undefined : 'button'}
      data-size={size}
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn('ui-sidebar-menu-button', className)}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        // Picking a destination on mobile closes the sheet
        if (isMobile && !e.defaultPrevented) setOpenMobile(false);
      }}
      {...props}
    >
      {children}
    </Comp>
  );
  return tooltip != null ? <SidebarTooltip trigger={button} label={tooltip} /> : button;
});

/** A count or status at the end of a row. Hidden on the rail. */
export const SidebarMenuBadge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SidebarMenuBadge(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-sidebar-menu-badge', className)} {...props} />;
});
