import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Direction of the line. Default `horizontal`. A vertical one needs a parent with a height (e.g. `h-4` in a flex row). */
  orientation?: 'horizontal' | 'vertical';
  /**
   * `true` (default): purely visual, hidden from assistive tech (`role="none"`).
   * `false`: a real thematic break (`role="separator"`) announced by screen readers.
   */
  decorative?: boolean;
}

/**
 * Separator — a quiet line between groups. With `children` it becomes a
 * labelled divider ("or") with the line on both sides. Server Component–safe.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = true, className, children, ...props },
  ref,
) {
  const a11y = decorative
    ? { role: 'none' as const }
    : { role: 'separator' as const, 'aria-orientation': orientation === 'vertical' ? ('vertical' as const) : undefined };
  const hasLabel = children !== undefined && children !== null && children !== false;
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn('ui-separator', hasLabel && 'ui-separator-label', className)}
      {...a11y}
      {...props}
    >
      {hasLabel && <span className="ui-separator-text">{children}</span>}
    </div>
  );
});
