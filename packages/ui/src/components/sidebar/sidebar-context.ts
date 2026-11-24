'use client';

import { createContext, useContext } from 'react';

export type SidebarSide = 'left' | 'right';
export type SidebarCollapsible = 'icon' | 'offcanvas' | 'none';

export interface SidebarContextValue {
  /** Desktop: expanded (true) or collapsed (false). */
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  /** Mobile: the off-canvas sheet. */
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((prev: boolean) => boolean)) => void;
  /** Viewport is below the mobile breakpoint: the sidebar is an off-canvas sheet. */
  isMobile: boolean;
  /** Collapsed to the rail right now (never true on mobile, where the sheet is always full). */
  collapsed: boolean;
  /** Toggle the desktop rail, or the sheet on mobile. */
  toggle: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

/** State of the nearest SidebarProvider. */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>.');
  return ctx;
}
