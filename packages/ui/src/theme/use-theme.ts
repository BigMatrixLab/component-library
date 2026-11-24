'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { THEME_STORAGE, type ThemePack } from './theme-script';

export type { ThemePack } from './theme-script';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeAccent = 'neutral' | 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'orange';
export const THEME_ACCENTS: ThemeAccent[] = ['neutral', 'violet', 'blue', 'emerald', 'rose', 'amber', 'orange'];

const EVENT = 'ui:theme';
const PACK_NAME = /^[a-z0-9-]+$/;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked (private mode) — the change still applies for this page */
  }
};
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Last pack chosen in this page — keeps working when storage is blocked. */
let sessionPack: string | null = null;

function apply() {
  const root = document.documentElement;
  const mode = (read(THEME_STORAGE.mode) as ThemeMode | null) ?? 'system';
  const accent = read(THEME_STORAGE.accent);
  const pack = read(THEME_STORAGE.pack) ?? sessionPack;
  // Swap without every element transitioning its colours
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  root.classList.toggle('dark', mode === 'dark' || (mode === 'system' && systemDark()));
  if (accent && accent !== 'neutral') root.setAttribute('data-accent', accent);
  else root.removeAttribute('data-accent');
  // Nothing chosen → keep a pack the server rendered on <html>
  if (pack && PACK_NAME.test(pack)) {
    if (pack === 'neutral') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', pack);
  }
  void root.offsetHeight;
  requestAnimationFrame(() => style.remove());
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

const currentPack = () => read(THEME_STORAGE.pack) ?? sessionPack ?? document.documentElement.getAttribute('data-theme') ?? 'neutral';
const snapshot = () =>
  `${read(THEME_STORAGE.mode) ?? 'system'}|${read(THEME_STORAGE.accent) ?? 'neutral'}|${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}|${currentPack()}`;
const serverSnapshot = () => 'system|neutral|light|neutral';

/**
 * Read and change the theme from any client component.
 *   const { mode, resolvedMode, accent, pack, setMode, setAccent, setPack, toggle } = useTheme();
 */
export function useTheme() {
  const snap = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [mode, accent, resolvedMode, pack] = snap.split('|') as [ThemeMode, ThemeAccent, 'light' | 'dark', ThemePack];

  // Follow the OS while in system mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => (read(THEME_STORAGE.mode) ?? 'system') === 'system' && apply();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    write(THEME_STORAGE.mode, next === 'system' ? null : next);
    apply();
  }, []);
  const setAccent = useCallback((next: ThemeAccent) => {
    write(THEME_STORAGE.accent, next === 'neutral' ? null : next);
    apply();
  }, []);
  /** Built-in pack or the name of your own `[data-theme="…"]` pack ([a-z0-9-]). */
  const setPack = useCallback((next: ThemePack | (string & {})) => {
    if (!PACK_NAME.test(next)) return;
    // `neutral` is stored explicitly: it must also override a pack the server rendered
    sessionPack = next;
    write(THEME_STORAGE.pack, next);
    apply();
  }, []);
  const toggle = useCallback(() => setMode(resolvedMode === 'dark' ? 'light' : 'dark'), [resolvedMode, setMode]);

  return { mode, resolvedMode, accent, pack, setMode, setAccent, setPack, toggle };
}
