'use client';

import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useRovingFocus } from '../../hooks/use-roving-focus';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { toggleClassName, type ToggleSize, type ToggleVariant } from './toggle';
import { useTabStop } from './use-tab-stop';

interface GroupContext {
  isOn: (value: string) => boolean;
  toggle: (value: string) => void;
  variant: ToggleVariant;
  size: ToggleSize;
  disabled: boolean;
}
const Ctx = createContext<GroupContext | null>(null);

interface ToggleGroupBase extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  /** Arrow keys move along this axis. Default `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
}
export interface ToggleGroupSingleProps extends ToggleGroupBase {
  type?: 'single';
  /** The pressed item's value, or '' when none. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
export interface ToggleGroupMultipleProps extends ToggleGroupBase {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

type Loose = ToggleGroupBase & {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: never) => void;
};

/**
 * ToggleGroup — a row of toggles, one pressed (`single`) or several (`multiple`).
 * One tab stop; arrow keys move focus between items (roving focus).
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(props, ref) {
  const {
    type = 'single',
    value,
    defaultValue,
    onValueChange,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    orientation = 'horizontal',
    className,
    role = 'group',
    onKeyDown,
    onFocus,
    ...rest
  } = props as Loose;

  const multiple = type === 'multiple';
  const [current, setCurrent] = useControllableState<string | string[]>({
    value,
    defaultValue: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange as ((v: string | string[]) => void) | undefined,
  });

  const stop = useTabStop('.ui-toggle', '[aria-pressed="true"]');
  const composedRef = useComposedRefs<HTMLDivElement>(ref, stop.ref);
  const roving = useRovingFocus({ itemSelector: '.ui-toggle', orientation, typeahead: false });

  const ctx: GroupContext = {
    isOn: (v) => (multiple ? (current as string[]).includes(v) : current === v),
    toggle: (v) => {
      if (multiple) {
        const list = current as string[];
        setCurrent(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
      } else {
        setCurrent(current === v ? '' : v);
      }
    },
    variant,
    size,
    disabled,
  };

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={composedRef}
        role={role}
        className={cn('ui-toggle-group', className)}
        data-variant={variant}
        data-orientation={orientation}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) roving(e);
        }}
        onFocus={(e) => {
          stop.onFocus(e);
          onFocus?.(e);
        }}
        {...rest}
      />
    </Ctx.Provider>
  );
});

export interface ToggleGroupItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  /** Square icon-only item. Give it an `aria-label`. */
  icon?: boolean;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, icon, className, disabled, onClick, type, ...props },
  ref,
) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ToggleGroupItem must be used inside <ToggleGroup>');
  const on = ctx.isOn(value);
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={toggleClassName({ variant: ctx.variant, size: ctx.size, icon, className })}
      aria-pressed={on}
      data-state={on ? 'on' : 'off'}
      disabled={disabled || ctx.disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.toggle(value);
      }}
      {...props}
    />
  );
});
