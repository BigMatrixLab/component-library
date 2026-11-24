'use client';

import { createContext, useContext, type MutableRefObject, type RefObject } from 'react';

/** How the menu was opened: decides where focus lands first. */
export type OpenMethod = 'pointer' | 'keyboard' | 'keyboard-last';

export interface MenuRootContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  triggerId: string;
  contentId: string;
  openMethod: MutableRefObject<OpenMethod>;
  /** Set true before closing from an outside click, so focus is not pulled back to the trigger. */
  skipFocusReturn: MutableRefObject<boolean>;
  /** Close the whole menu (an item was chosen). */
  closeMenu: () => void;
}

export const MenuRootContext = createContext<MenuRootContextValue | null>(null);

export function useMenuRoot(component: string) {
  const ctx = useContext(MenuRootContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenu>.`);
  return ctx;
}

/** The open submenu of one menu panel, so hovering another item can close it. */
export interface ActiveSub {
  id: string;
  triggerEl: HTMLElement | null;
  close: () => void;
  getPanelRect: () => DOMRect | null;
  /** Where the pointer was when it left the submenu trigger (for the grace triangle). */
  getExit: () => { x: number; y: number; t: number } | null;
}

/** One `role="menu"` panel: the root menu or a submenu. */
export interface MenuPanelContextValue {
  /** Items carry data-menu-owner so nested panels never mix their items. */
  ownerId: string;
  activeSub: MutableRefObject<ActiveSub | null>;
}

export const MenuPanelContext = createContext<MenuPanelContextValue | null>(null);

export function useMenuPanel(component: string) {
  const ctx = useContext(MenuPanelContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenuContent>.`);
  return ctx;
}

/** Selector for the items that belong to one panel. */
export const ownedItems = (ownerId: string) => `[data-menu-owner="${ownerId}"]`;

/** Focus the first (or last) enabled item of a panel. */
export function focusItem(panel: HTMLElement, ownerId: string, which: 'first' | 'last') {
  const items = Array.from(panel.querySelectorAll<HTMLElement>(ownedItems(ownerId))).filter(
    (el) => !el.hasAttribute('data-disabled'),
  );
  const target = which === 'first' ? items[0] : items[items.length - 1];
  (target ?? panel).focus({ preventScroll: true });
}

/** True when the event came from this panel itself, not from a submenu nested inside it. */
export function isOwnEvent(e: { target: EventTarget | null; currentTarget: EventTarget | null }) {
  return (e.target as Element | null)?.closest('[role="menu"]') === e.currentTarget;
}

/* Grace area: moving diagonally from a submenu trigger toward its panel must
   not close the submenu when the pointer crosses the items in between. */

const GRACE_MS = 400;

function inTriangle(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const sign = (p1: typeof p, p2: typeof p, p3: typeof p) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Is the pointer heading toward the open submenu? */
export function pointerInGrace(sub: ActiveSub, x: number, y: number) {
  const exit = sub.getExit();
  const rect = sub.getPanelRect();
  if (!exit || !rect || Date.now() - exit.t > GRACE_MS) return false;
  const toRight = rect.left >= exit.x;
  const edgeX = toRight ? rect.left : rect.right;
  return inTriangle({ x, y }, exit, { x: edgeX, y: rect.top }, { x: edgeX, y: rect.bottom });
}
