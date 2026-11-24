'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIndicator } from '../../hooks/use-indicator';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useRovingFocus } from '../../hooks/use-roving-focus';

export type TabsVariant = 'segmented' | 'underline' | 'pills';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  variant: TabsVariant;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>.`);
  return ctx;
}

/** Ids must be valid for aria-controls / aria-labelledby whatever the value looks like. */
const slug = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_');

/* -------------------------------------------------------------------------- */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled selected tab. */
  value?: string;
  /** Initially selected tab when uncontrolled. */
  defaultValue?: string;
  /** Called when the selected tab changes. */
  onValueChange?: (value: string) => void;
  /** `segmented` (raised pill on a track), `underline` or `pills`. Default `segmented`. */
  variant?: TabsVariant;
  /** Arrow keys move along this axis. Default `horizontal`. */
  orientation?: TabsOrientation;
  /** `automatic` selects a tab as it gets focus; `manual` waits for Enter or Space. Default `automatic`. */
  activationMode?: TabsActivationMode;
}

/**
 * Tabs — switch between views in place. One indicator glides between the
 * triggers; keyboard follows the WAI-ARIA tabs pattern.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    variant = 'segmented',
    orientation = 'horizontal',
    activationMode = 'automatic',
    className,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const baseId = useId();
  // Panels animate in only after the first change, never on page load
  const [interacted, setInteracted] = useState(false);
  const first = useRef(value);
  useEffect(() => {
    if (value !== first.current) setInteracted(true);
  }, [value]);

  return (
    <TabsContext.Provider value={{ value, setValue, baseId, variant, orientation, activationMode }}>
      <div
        ref={ref}
        className={cn('ui-tabs', className)}
        data-orientation={orientation}
        data-variant={variant}
        data-interacted={interacted ? '' : undefined}
        {...props}
      />
    </TabsContext.Provider>
  );
});

/* -------------------------------------------------------------------------- */

export const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TabsList(
  { className, children, onKeyDown, ...props },
  forwardedRef,
) {
  const ctx = useTabsContext('TabsList');
  const listRef = useRef<HTMLDivElement>(null);
  const ref = useComposedRefs(forwardedRef, listRef);

  useIndicator(listRef, '[role="tab"][aria-selected="true"]', ctx.value);

  // Roving tabindex: when nothing is selected, the first enabled tab stays reachable
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list || list.querySelector('[role="tab"][aria-selected="true"]')) return;
    list.querySelector<HTMLElement>('[role="tab"]:not(:disabled)')?.setAttribute('tabindex', '0');
  });

  const roving = useRovingFocus({
    itemSelector: '[role="tab"]',
    orientation: ctx.orientation,
    typeahead: false,
    onMove: (item) => {
      if (ctx.activationMode === 'automatic' && item.dataset.value !== undefined) ctx.setValue(item.dataset.value);
    },
  });

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={ctx.orientation}
      data-variant={ctx.variant}
      data-orientation={ctx.orientation}
      className={cn('ui-tabs-list', className)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) roving(e);
      }}
      {...props}
    >
      {children}
      <span className="ui-tabs-indicator" role="presentation" aria-hidden="true" />
    </div>
  );
});

/* -------------------------------------------------------------------------- */

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Ties this trigger to the TabsContent with the same value. */
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, className, onClick, ...props },
  ref,
) {
  const ctx = useTabsContext('TabsTrigger');
  const selected = ctx.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${ctx.baseId}-trigger-${slug(value)}`}
      data-value={value}
      aria-selected={selected}
      aria-controls={selected ? `${ctx.baseId}-content-${slug(value)}` : undefined}
      data-state={selected ? 'active' : 'inactive'}
      tabIndex={selected ? 0 : -1}
      className={cn('ui-tabs-trigger', className)}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setValue(value);
      }}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Shown while the trigger with the same value is selected. */
  value: string;
  /** Keep the panel in the DOM (hidden) while inactive, to preserve its state. */
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, forceMount = false, className, ...props },
  ref,
) {
  const ctx = useTabsContext('TabsContent');
  const selected = ctx.value === value;
  if (!selected && !forceMount) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-content-${slug(value)}`}
      aria-labelledby={`${ctx.baseId}-trigger-${slug(value)}`}
      data-state={selected ? 'active' : 'inactive'}
      hidden={!selected}
      tabIndex={0}
      className={cn('ui-tabs-content', className)}
      {...props}
    />
  );
});
