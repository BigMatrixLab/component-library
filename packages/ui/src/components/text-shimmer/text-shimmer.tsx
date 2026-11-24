import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

export interface TextShimmerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Run the sweep. `false` shows plain text in the inherited colour (e.g. once the work is done). Default `true`. */
  active?: boolean;
  /** One sweep, in milliseconds. Default 2000. */
  duration?: number;
  /** Render the child element instead (e.g. a heading), keeping the shimmer. */
  asChild?: boolean;
}

/**
 * TextShimmer — a soft band of light that sweeps across text, for loading and "thinking" labels.
 * Pure CSS (gradient + background-clip: text), Server Component–safe. Reduced motion shows the
 * text static in the muted colour. It does not announce anything: wrap it in a `role="status"`
 * region when the label itself is the news.
 */
export const TextShimmer = forwardRef<HTMLSpanElement, TextShimmerProps>(function TextShimmer(
  { active = true, duration, asChild = false, className, style, children, ...props },
  ref,
) {
  const shared = {
    className: cn('ui-text-shimmer', className),
    'data-state': active ? 'active' : 'idle',
    style: (duration !== undefined ? { '--ui-text-shimmer-duration': `${duration}ms`, ...style } : style) as CSSProperties,
    ...props,
  };
  if (asChild) {
    return (
      <Slot ref={ref as never} {...shared}>
        {children}
      </Slot>
    );
  }
  return (
    <span ref={ref} {...shared}>
      {children}
    </span>
  );
});
