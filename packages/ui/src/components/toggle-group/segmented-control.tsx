'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useTabStop } from './use-tab-stop';

interface SegCtx {
  value: string;
  select: (value: string) => void;
  disabled: boolean;
}
const Ctx = createContext<SegCtx | null>(null);

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to the container; items share the width equally. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Submitted with a form (a hidden input carries the value). */
  name?: string;
}

/**
 * SegmentedControl — radio-like choice between a few views. One highlight pill
 * glides to the selected option (measured, CSS variables, morph spring).
 * Arrow keys move AND select (radiogroup).
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { value, defaultValue = '', onValueChange, size = 'md', fullWidth, disabled = false, name, className, onKeyDown, onFocus, children, ...props },
  ref,
) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const stop = useTabStop('.ui-seg-item', '[aria-checked="true"]');
  const composedRef = useComposedRefs<HTMLDivElement>(ref, stop.ref);
  const roving = useRovingFocus({
    itemSelector: '.ui-seg-item',
    orientation: 'both',
    typeahead: false,
    onMove: (item) => item.click(),
  });

  // Put the pill on the selected item (CSS variables on the root)
  const measure = () => {
    const root = stop.ref.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('.ui-seg-item[aria-checked="true"]');
    if (!active) {
      root.removeAttribute('data-has-pill');
      return;
    }
    root.style.setProperty('--ui-seg-x', `${active.offsetLeft}px`);
    root.style.setProperty('--ui-seg-y', `${active.offsetTop}px`);
    root.style.setProperty('--ui-seg-w', `${active.offsetWidth}px`);
    root.style.setProperty('--ui-seg-h', `${active.offsetHeight}px`);
    root.setAttribute('data-has-pill', '');
  };
  useIsomorphicLayoutEffect(measure);

  useEffect(() => {
    const root = stop.ref.current;
    if (!root) return;
    // Enable the glide only after the first position is painted: no animation on mount
    const raf = requestAnimationFrame(() => root.setAttribute('data-ready', ''));
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => measure());
    ro?.observe(root);
    root.querySelectorAll('.ui-seg-item').forEach((el) => ro?.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <Ctx.Provider value={{ value: current, select: setCurrent, disabled }}>
      <div
        ref={composedRef}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        className={cn('ui-seg', className)}
        data-size={size === 'md' ? undefined : size}
        data-full={fullWidth || undefined}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) roving(e);
        }}
        onFocus={(e) => {
          stop.onFocus(e);
          onFocus?.(e);
        }}
        {...props}
      >
        <span className="ui-seg-pill" aria-hidden="true" />
        {children}
        {name && <input type="hidden" name={name} value={current} />}
      </div>
    </Ctx.Provider>
  );
});

export interface SegmentedControlItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(function SegmentedControlItem(
  { value, className, disabled, onClick, type, ...props },
  ref,
) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('SegmentedControlItem must be used inside <SegmentedControl>');
  const checked = ctx.value === value;
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      role="radio"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn('ui-seg-item', className)}
      disabled={disabled || ctx.disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.select(value);
      }}
      {...props}
    />
  );
});
