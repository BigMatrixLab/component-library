'use client';

import { createContext, isValidElement, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type CommandFilter = (value: string, search: string, keywords: string[]) => number;

export interface CommandContextValue {
  search: string;
  setSearch: (search: string) => void;
  shouldFilter: boolean;
  filter: CommandFilter;
  listId: string;
  inputId: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  /** Items register while they match, so groups and the empty state know what is visible. */
  register: (id: string) => () => void;
  /** No visible item while a search is typed. */
  empty: boolean;
  /** Called after an item runs (CommandDialog closes itself here). */
  onItemSelect?: (value: string) => void;
}

export const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandContext(component: string) {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Command>.`);
  return ctx;
}

/** A group tracks its own visible items so it can hide when a search leaves it empty. */
export interface CommandGroupContextValue {
  register: (id: string) => () => void;
}

export const CommandGroupContext = createContext<CommandGroupContextValue | null>(null);

/** Counts the ids that registered themselves. */
export function useVisibleCount() {
  const ids = useRef(new Set<string>());
  const [count, setCount] = useState(0);
  const register = useCallback((id: string) => {
    ids.current.add(id);
    setCount(ids.current.size);
    return () => {
      ids.current.delete(id);
      setCount(ids.current.size);
    };
  }, []);
  return { count, register };
}

/** Plain text of a React node: the default search value of an item. */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

const OPTIONS = '[role="option"]:not([aria-disabled="true"])';

/** Enabled options in the order they appear on screen (ranking can reorder them with CSS). */
export function visualOptions(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(OPTIONS))
    .map((el, i) => ({ el, i, top: el.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top || a.i - b.i)
    .map((x) => x.el);
}
