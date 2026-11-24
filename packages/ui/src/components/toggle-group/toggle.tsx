'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { cn } from '../../lib/cn';

export type ToggleVariant = 'ghost' | 'outline';
export type ToggleSize = 'sm' | 'md' | 'lg';

export function toggleClassName({
  variant = 'ghost',
  size = 'md',
  icon = false,
  className,
}: { variant?: ToggleVariant; size?: ToggleSize; icon?: boolean; className?: string } = {}) {
  return cn(
    'ui-toggle',
    variant === 'outline' && 'ui-toggle-outline',
    size !== 'md' && `ui-toggle-${size}`,
    icon && 'ui-toggle-icon',
    className,
  );
}

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Pressed state (controlled). */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** `ghost` is transparent until pressed; `outline` adds a border. Default `ghost`. */
  variant?: ToggleVariant;
  /** Height: 32 / 36 / 44px. Default `md`. */
  size?: ToggleSize;
  /** Square icon-only toggle. Give it an `aria-label`. */
  icon?: boolean;
}

/** Toggle — a button that stays pressed (`aria-pressed`), e.g. Bold, Mute, Pin. */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed = false, onPressedChange, variant, size, icon, className, onClick, type, ...props },
  ref,
) {
  const [on, setOn] = useControllableState({ value: pressed, defaultValue: defaultPressed, onChange: onPressedChange });
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={toggleClassName({ variant, size, icon, className })}
      aria-pressed={on}
      data-state={on ? 'on' : 'off'}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
      {...props}
    />
  );
});
