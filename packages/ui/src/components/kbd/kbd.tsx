import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type KbdSize = 'sm' | 'md' | 'lg';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** 20 / 24 / 28px tall. Default `md`. */
  size?: KbdSize;
}

/** Kbd — one key cap. Server Component–safe. Symbols (⌘ ⇧ ⌥) or short words (Esc, Enter). */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ size, className, ...props }, ref) {
  return <kbd ref={ref} className={cn('ui-kbd', size && size !== 'md' && `ui-kbd-${size}`, className)} {...props} />;
});

export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** Draw a "+" between the keys. Default: keys sit side by side. */
  plus?: boolean;
}

/** KbdGroup — a combination such as ⌘ K or Ctrl + Shift + P. */
export const KbdGroup = forwardRef<HTMLSpanElement, KbdGroupProps>(function KbdGroup(
  { plus = false, className, role, ...props },
  ref,
) {
  // A labelled group is announced as a group (a bare aria-label on a span is not valid)
  return <span ref={ref} role={role ?? (props['aria-label'] ? 'group' : undefined)} className={cn('ui-kbd-group', plus && 'ui-kbd-group-plus', className)} {...props} />;
});
