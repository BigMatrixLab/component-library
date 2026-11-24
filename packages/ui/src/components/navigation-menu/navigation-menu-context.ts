'use client';

import { createContext, useContext, type MutableRefObject } from 'react';

export type NavigationMenuMode = 'menu' | 'accordion';
/** Which side the new content comes from when moving between triggers. */
export type NavigationMenuDirection = 'start' | 'end' | null;

export interface NavigationMenuContextValue {
  /** The open item's value, or '' when closed. */
  value: string;
  /** The last non-empty value (the content that stays visible while the panel fades out). */
  lastValue: string;
  mode: NavigationMenuMode;
  /** Element the open item's content is portaled into (menu mode). */
  slot: HTMLElement | null;
  direction: NavigationMenuDirection;
  triggers: MutableRefObject<Map<string, HTMLElement>>;
  /** Set before opening from the keyboard: the content moves focus to its first link once mounted. */
  focusOnOpen: MutableRefObject<boolean>;
  /** The open state came from hovering (a click right after must not close it). */
  hoverOpened: MutableRefObject<boolean>;
  select: (value: string, how: 'hover' | 'click' | 'keyboard') => void;
  close: () => void;
  focusContent: () => void;
  hoverIn: (value: string) => void;
  hoverElsewhere: () => void;
}

export const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

export function useNavigationMenu(component: string) {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <NavigationMenu>.`);
  return ctx;
}

export interface NavigationMenuItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
}

export const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue | null>(null);

export function useNavigationMenuItem(component: string) {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <NavigationMenuItem>.`);
  return ctx;
}

/** True for links rendered inside a content panel (rich links, not the top-level bar links). */
export const NavigationMenuInContentContext = createContext(false);

/** Elements the keyboard can land on inside a panel. */
export const FOCUSABLE = 'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])';
