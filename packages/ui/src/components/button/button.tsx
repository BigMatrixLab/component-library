'use client';

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Use one primary action per surface. Default `primary`. */
  variant?: ButtonVariant;
  /** Height and padding: 28 / 32 / 36 / 44px. Default `md`. */
  size?: ButtonSize;
  /** Square icon-only button. Give it an `aria-label`. */
  icon?: boolean;
  /**
   * Shows a spinner, sets `aria-busy` and ignores clicks while keeping focus
   * (it does not set `disabled`, so keyboard focus is not lost mid-action).
   */
  loading?: boolean;
  /** Render the child element instead (e.g. a Next.js `<Link>`), keeping button styles. */
  asChild?: boolean;
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  icon = false,
  className,
}: Pick<ButtonProps, 'variant' | 'size' | 'icon' | 'className'> = {}) {
  return cn(
    'ui-btn',
    variant !== 'primary' && `ui-btn-${variant}`,
    size !== 'md' && `ui-btn-${size}`,
    icon && 'ui-btn-icon',
    className,
  );
}

/**
 * Button — a native button with press feedback, variants, sizes and a
 * loading state. A client component (it guards clicks while loading);
 * use buttonClassName() for a zero-JS button in Server Components.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, loading = false, asChild = false, className, type, onClick, children, ...props },
  ref,
) {
  const classes = buttonClassName({ variant, size, icon, className });

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} aria-busy={loading || undefined} {...(props as HTMLAttributes<HTMLElement>)}>
        {children}
      </Slot>
    );
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className="ui-btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {}

/** Joins adjacent buttons into one control. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, role = 'group', ...props },
  ref,
) {
  return <div ref={ref} role={role} className={cn('ui-btn-group', className)} {...props} />;
});
