import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SpinnerVariant = 'ring' | 'dots';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** `ring` (default) or `dots`. */
  variant?: SpinnerVariant;
  /** 12 / 16 / 20 / 28 / 40px. Default `md`. */
  size?: SpinnerSize;
  /**
   * Text for screen readers (role="status" + visually hidden text). Default "Loading".
   * Pass `false` when the spinner sits inside something that already says it is busy
   * (a labelled button): it then becomes purely decorative.
   */
  label?: string | false;
}

/**
 * Spinner — work in progress, duration unknown. Inherits `currentColor`.
 * Server Component–safe. For a known amount of work use Progress.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { variant = 'ring', size = 'md', label = 'Loading', className, ...props },
  ref,
) {
  const decorative = label === false;
  return (
    <span
      ref={ref}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
      className={cn('ui-spinner', size !== 'md' && `ui-spinner-${size}`, className)}
      {...props}
    >
      {variant === 'dots' ? (
        <span className="ui-spinner-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <span className="ui-spinner-ring" aria-hidden="true" />
      )}
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
});
