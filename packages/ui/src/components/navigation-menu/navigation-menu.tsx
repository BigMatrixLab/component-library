'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { prefersReducedMotion } from '../../lib/dom';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useDismiss } from '../../hooks/use-dismiss';
import { useHoverIntent } from '../../hooks/use-hover-intent';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { usePresence } from '../../hooks/use-presence';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import {
  FOCUSABLE,
  NavigationMenuContext,
  type NavigationMenuContextValue,
  type NavigationMenuDirection,
  type NavigationMenuMode,
} from './navigation-menu-context';

const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

/** Where the shared panel's surface and caret were (viewport px), for the glide between items. */
interface Geometry {
  left: number;
  top: number;
  width: number;
  height: number;
  caretX: number;
}

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export interface NavigationMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange'> {
  /** The open item's `value`, or '' for none. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * `auto` (default) is a floating panel on wide viewports and an accordion on
   * narrow ones (below `collapseBelow`). Force one with `menu` or `accordion`
   * (e.g. `accordion` when the menu lives inside the mobile Sheet).
   */
  mode?: 'auto' | NavigationMenuMode;
  /** Viewport width (px) under which `auto` switches to the accordion. Default 768. */
  collapseBelow?: number;
  /** Hover intent: ms before a trigger opens its panel. Default 120. */
  openDelay?: number;
  /** ms before the panel closes after the pointer leaves it. Default 240. */
  closeDelay?: number;
}

/**
 * NavigationMenu — site header menus that share ONE floating panel. The panel
 * resizes to the open item, the content slides in from the side of travel and
 * a caret glides under the active trigger. On narrow screens it is an accordion.
 */
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    mode: modeProp = 'auto',
    collapseBelow = 768,
    openDelay = 120,
    closeDelay = 240,
    className,
    children,
    onBlur,
    onPointerEnter,
    onPointerLeave,
    ...props
  },
  forwardedRef,
) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const rootRef = useRef<HTMLElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const triggers = useRef(new Map<string, HTMLElement>());
  const focusOnOpen = useRef(false);
  const hoverOpened = useRef(false);
  const from = useRef<Geometry | null>(null);
  const animations = useRef<Animation[]>([]);
  const intent = useHoverIntent();
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [direction, setDirection] = useState<NavigationMenuDirection>(null);
  const [narrow, setNarrow] = useState(false);

  const lastValue = useRef('');
  if (value) lastValue.current = value;
  const valueRef = useRef(value);
  valueRef.current = value;

  useIsomorphicLayoutEffect(() => {
    if (modeProp !== 'auto') return;
    const mq = window.matchMedia(`(max-width: ${collapseBelow - 1}px)`);
    const read = () => setNarrow(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, [modeProp, collapseBelow]);
  const mode: NavigationMenuMode = modeProp === 'auto' ? (narrow ? 'accordion' : 'menu') : modeProp;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const open = value !== '' && mode === 'menu';
  const { mounted, state, ref: panelRef } = usePresence<HTMLDivElement>(open);

  const setSlotRef = useCallback((el: HTMLDivElement | null) => {
    slotRef.current = el;
    setSlot(el);
  }, []);

  const close = useCallback(() => {
    intent.cancel();
    from.current = null;
    setDirection(null);
    setValue('');
  }, [intent, setValue]);

  const select = useCallback<NavigationMenuContextValue['select']>(
    (next, how) => {
      intent.cancel();
      const current = valueRef.current;
      if (next === current) return;
      if (!next) {
        close();
        return;
      }
      if (modeRef.current === 'menu' && current && surfaceRef.current) {
        // Moving between items: remember the panel's box and which way we travel
        const s = surfaceRef.current.getBoundingClientRect();
        const c = caretRef.current?.getBoundingClientRect();
        from.current = {
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height,
          caretX: c ? c.left + c.width / 2 : s.left + s.width / 2,
        };
        const a = triggers.current.get(current)?.getBoundingClientRect();
        const b = triggers.current.get(next)?.getBoundingClientRect();
        setDirection(a && b ? (b.left > a.left ? 'end' : 'start') : null);
      } else {
        from.current = null;
        setDirection(null);
      }
      hoverOpened.current = how === 'hover';
      setValue(next);
    },
    [intent, close, setValue],
  );

  const hoverIn = useCallback(
    (next: string) => {
      if (modeRef.current !== 'menu') return;
      // Already browsing the bar: switch at once. Otherwise wait for intent.
      intent.start(() => select(next, 'hover'), valueRef.current ? 0 : openDelay);
    },
    [intent, select, openDelay],
  );

  const hoverElsewhere = useCallback(() => {
    intent.cancel();
    if (valueRef.current) intent.start(close, 150);
  }, [intent, close]);

  const focusContent = useCallback(() => {
    slotRef.current
      ?.querySelector('.ui-nav-menu-content[data-state="open"]')
      ?.querySelector<HTMLElement>(FOCUSABLE)
      ?.focus();
  }, []);

  /** Centre the panel under the active trigger (kept inside the viewport) and aim the caret. */
  const place = useCallback((): Geometry | null => {
    const panel = panelRef.current;
    const surface = surfaceRef.current;
    const slotEl = slotRef.current;
    const trigger = triggers.current.get(valueRef.current || lastValue.current);
    if (!panel || !surface || !slotEl || !trigger) return null;
    const t = trigger.getBoundingClientRect();
    // The slot is the content's natural size, independent of the surface's animated size
    const width = slotEl.offsetWidth + (surface.offsetWidth - surface.clientWidth);
    const height = slotEl.offsetHeight + (surface.offsetHeight - surface.clientHeight);
    const viewport = document.documentElement.clientWidth;
    const centre = t.left + t.width / 2;
    const left = Math.round(Math.max(8, Math.min(centre - width / 2, viewport - width - 8)));
    const top = Math.round(t.bottom + 12);
    const caret = Math.round(Math.min(Math.max(centre - left, 20), Math.max(20, width - 20)));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.setProperty('--ui-nav-caret-x', `${caret}px`);
    panel.style.setProperty('--ui-origin', `${caret}px 0px`);
    return { left, top, width, height, caretX: left + caret };
  }, [panelRef]);

  // Show the panel in the top layer, place it, and glide from the previous item's box
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    if (supportsPopover && !panel.matches(':popover-open')) {
      try {
        panel.showPopover();
      } catch {
        /* already open or detached */
      }
    }
    for (const a of animations.current) a.cancel();
    animations.current = [];
    const geo = place();
    const start = from.current;
    from.current = null;
    const surface = surfaceRef.current;
    const caret = caretRef.current;
    if (!geo || !start || !surface || !caret || prefersReducedMotion()) return;
    try {
      const easing = cssVar('--ui-spring-smooth') || 'cubic-bezier(0.22, 1, 0.36, 1)';
      const duration = parseFloat(cssVar('--ui-spring-smooth-duration')) || 540;
      const timing = { duration, easing };
      const dx = start.left - geo.left;
      const dy = start.top - geo.top;
      animations.current = [
        panel.animate({ translate: [`${dx}px ${dy}px`, '0px 0px'] }, timing),
        surface.animate(
          { width: [`${start.width}px`, `${geo.width}px`], height: [`${start.height}px`, `${geo.height}px`] },
          timing,
        ),
        caret.animate({ translate: [`${start.caretX - geo.caretX - dx}px 0px`, '0px 0px'] }, timing),
      ];
    } catch {
      /* unsupported easing or property: the content still slides */
    }
  }, [open, value, slot, place, panelRef]);

  // Follow resize, scroll and content size changes while open
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (slot) ro?.observe(slot);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      ro?.disconnect();
    };
  }, [open, slot, place]);

  useDismiss(value !== '', [rootRef, panelRef], (reason) => {
    const last = lastValue.current;
    close();
    if (reason === 'escape') triggers.current.get(last)?.focus();
  });

  const rovePanel = useRovingFocus({
    itemSelector: 'a[href], button:not(:disabled)',
    orientation: 'both',
    loop: false,
    typeahead: false,
  });

  const ctx: NavigationMenuContextValue = {
    value,
    lastValue: lastValue.current,
    mode,
    slot,
    direction,
    triggers,
    focusOnOpen,
    hoverOpened,
    select,
    close,
    focusContent,
    hoverIn,
    hoverElsewhere,
  };

  return (
    <NavigationMenuContext.Provider value={ctx}>
      <nav
        ref={ref}
        aria-label="Site menu"
        {...props}
        data-mode={mode}
        className={cn('ui-nav-menu', className)}
        onPointerEnter={(e: PointerEvent<HTMLElement>) => {
          onPointerEnter?.(e);
          if (e.pointerType === 'mouse') intent.cancel();
        }}
        onPointerLeave={(e: PointerEvent<HTMLElement>) => {
          onPointerLeave?.(e);
          if (e.pointerType !== 'mouse' || modeRef.current !== 'menu') return;
          if (valueRef.current) intent.start(close, closeDelay);
          else intent.cancel();
        }}
        onBlur={(e: FocusEvent<HTMLElement>) => {
          onBlur?.(e);
          if (modeRef.current !== 'menu' || !valueRef.current) return;
          const next = e.relatedTarget as Node | null;
          if (next && !e.currentTarget.contains(next)) close();
        }}
      >
        {children}
        {mode === 'menu' && mounted && (
          <div
            ref={panelRef}
            popover="manual"
            data-state={state}
            data-side="bottom"
            className="ui-floating ui-nav-menu-panel"
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'ArrowUp') {
                // Up from the first link goes back to the trigger
                const first = e.currentTarget.querySelector<HTMLElement>(FOCUSABLE);
                if (first && document.activeElement === first) {
                  e.preventDefault();
                  triggers.current.get(valueRef.current)?.focus();
                  return;
                }
              }
              rovePanel(e);
            }}
          >
            <div ref={surfaceRef} className="ui-nav-menu-surface">
              <div ref={setSlotRef} className="ui-nav-menu-slot" />
            </div>
            <span ref={caretRef} className="ui-nav-menu-caret" aria-hidden="true" />
          </div>
        )}
      </nav>
    </NavigationMenuContext.Provider>
  );
});
