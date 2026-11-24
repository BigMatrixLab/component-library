'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { dismissToast, getServerSnapshot, getSnapshot, subscribe } from './store';
import { ToastItem } from './toast-item';
import type { ToasterPosition } from './types';
import { useToastLayer } from './use-toast-layer';
import type { SwipeDirection } from './use-swipe';

export interface ToasterProps {
  /** Name for this Toaster, so `toast(…, { toasterId })` can target it. Only needed with several Toasters. */
  id?: string;
  /** Where the stack docks. Default `bottom-right`. */
  position?: ToasterPosition;
  /** How many toasts show at once; older ones wait out of sight. Default 3. */
  visibleToasts?: number;
  /** Keep the stack expanded instead of collapsed behind the newest toast. */
  expand?: boolean;
  /** Tint toasts by type (success, error, warning, info). */
  richColors?: boolean;
  /** Show a × button on every toast. */
  closeButton?: boolean;
  /** Space between expanded toasts, px. Default 14. */
  gap?: number;
  /** Distance from the screen edge: a number (px) or any CSS length. Default 24px (16px on phones). */
  offset?: number | string;
  /** Default auto-dismiss time in ms. Default 4000. */
  duration?: number;
  /** Accessible name of the region. Default `Notifications`. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

function directionsFor(position: ToasterPosition): SwipeDirection[] {
  const [y, x] = position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
  const out: SwipeDirection[] = [y === 'top' ? 'up' : 'down'];
  if (x === 'left') out.push('left');
  if (x === 'right') out.push('right');
  return out;
}

const cssLength = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

interface Layout {
  index: number;
  offset: number;
}

/**
 * Toaster — mount once (e.g. in your root layout); call `toast()` from anywhere.
 * Renders into the top layer so toasts sit above modal dialogs.
 */
export function Toaster({
  id,
  position = 'bottom-right',
  visibleToasts = 3,
  expand = false,
  richColors = false,
  closeButton = false,
  gap = 14,
  offset,
  duration = 4000,
  label = 'Notifications',
  className,
  style,
}: ToasterProps) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toasts = useMemo(() => all.filter((t) => t.toasterId === id), [all, id]);
  const countRef = useRef(0);
  countRef.current = toasts.length;
  const layer = useToastLayer();
  const regionRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const onHeight = useCallback((id: string | number, h: number) => {
    setHeights((prev) => (prev[String(id)] === h ? prev : { ...prev, [String(id)]: h }));
  }, []);

  /* Alt+T or F8 moves focus to the region; Esc hands it back. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!((e.altKey && e.code === 'KeyT') || e.key === 'F8')) return;
      const region = regionRef.current;
      if (!region || !countRef.current) return;
      e.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      if (active && !region.contains(active)) returnFocus.current = active;
      region.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [layer]);

  /* Timers stop while the tab is hidden. */
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* …and while a finger or button is held down on a toast (e.g. mid-swipe). */
  useEffect(() => {
    if (!pressed) return;
    const up = () => setPressed(false);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    return () => {
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };
  }, [pressed]);

  /* Stack order: newest first. Leaving toasts keep the place they had. */
  const lastLayout = useRef(new Map<string, Layout>());
  const { layout, frontHeight, liveCount } = useMemo(() => {
    const live = toasts.filter((t) => !t.dismissed).reverse();
    const map = new Map<string, Layout>();
    let acc = 0;
    live.forEach((t, index) => {
      map.set(String(t.id), { index, offset: acc });
      acc += (heights[String(t.id)] ?? 0) + gap;
    });
    return { layout: map, frontHeight: live[0] ? (heights[String(live[0].id)] ?? 0) : 0, liveCount: live.length };
  }, [toasts, heights, gap]);
  layout.forEach((v, k) => lastLayout.current.set(k, v));
  // Forget layouts of toasts that are gone
  lastLayout.current.forEach((_, k) => {
    if (!toasts.some((t) => String(t.id) === k)) lastLayout.current.delete(k);
  });

  // Drop measurements of removed toasts
  useEffect(() => {
    setHeights((prev) => {
      const ids = new Set(toasts.map((t) => String(t.id)));
      const keys = Object.keys(prev);
      if (keys.every((k) => ids.has(k))) return prev;
      return Object.fromEntries(keys.filter((k) => ids.has(k)).map((k) => [k, prev[k]!]));
    });
  }, [toasts]);

  if (!layer) return null;

  const [y, x] = position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
  const expanded = expand || hovered || focused;
  const paused = hovered || focused || pressed || pageHidden;
  const directions = directionsFor(position);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const slot = (e.target as HTMLElement).closest<HTMLElement>('[data-toast-id]');
    const record = slot && toasts.find((t) => String(t.id) === slot.dataset.toastId);
    if (record && record.dismissible === false) return;
    e.preventDefault();
    if (record) dismissToast(record.id);
    const back = returnFocus.current;
    returnFocus.current = null;
    if (back?.isConnected) back.focus();
    else (document.activeElement as HTMLElement | null)?.blur();
  };

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  const regionStyle = {
    '--ui-toaster-gap': `${gap}px`,
    ...(offset !== undefined && { '--ui-toaster-offset': cssLength(offset) }),
    ...style,
  } as CSSProperties;

  return createPortal(
    <section
      ref={regionRef}
      aria-label={label}
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      tabIndex={-1}
      className={cn('ui-toaster', className)}
      data-y={y}
      data-x={x}
      data-expanded={expanded}
      data-rich-colors={richColors || undefined}
      style={regionStyle}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      onPointerEnter={(e) => e.pointerType !== 'touch' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={() => setPressed(true)}
    >
      <ol className="ui-toaster-list">
        {toasts.map((t) => {
          const l = layout.get(String(t.id)) ?? lastLayout.current.get(String(t.id)) ?? { index: 0, offset: 0 };
          return (
            <ToastItem
              key={t.id}
              toast={t}
              index={l.index}
              count={liveCount}
              height={heights[String(t.id)]}
              frontHeight={frontHeight}
              offset={l.offset}
              expanded={expanded}
              visible={l.index < visibleToasts}
              visibleToasts={visibleToasts}
              paused={paused}
              duration={duration}
              closeButton={closeButton}
              directions={directions}
              onHeight={onHeight}
            />
          );
        })}
      </ol>
    </section>,
    layer,
  );
}
