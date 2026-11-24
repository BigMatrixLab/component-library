import { cloneElement, forwardRef, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour. `default`, `secondary` and `outline` are neutral; the rest are status tones. Default `default`. */
  variant?: BadgeVariant;
  /** Height and padding: 20 / 24 / 28px. Default `md`. */
  size?: BadgeSize;
  /** Status tones only: a solid fill instead of the faint tint (e.g. a counter). */
  solid?: boolean;
  /** Show a leading status dot in the tone colour. */
  dot?: boolean;
  /** Pulsing dot for something happening right now. Implies `dot`. */
  live?: boolean;
  /** Render the child element instead (e.g. a link), keeping badge styles. */
  asChild?: boolean;
}

export function badgeClassName({
  variant = 'default',
  size = 'md',
  solid = false,
  className,
}: Pick<BadgeProps, 'variant' | 'size' | 'solid' | 'className'> = {}) {
  return cn(
    'ui-badge',
    variant !== 'default' && `ui-badge-${variant}`,
    size !== 'md' && `ui-badge-${size}`,
    solid && 'ui-badge-solid',
    className,
  );
}

/**
 * Badge — a small label for status or metadata. Server Component–safe.
 * Put an `Icon` or text inside; add `dot` / `live` for a status dot.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, size, solid, dot, live, asChild = false, className, children, ...props },
  ref,
) {
  const classes = badgeClassName({ variant, size, solid, className });
  if (asChild) {
    let content: ReactNode = children;
    // Keep the status dot: prepend it to the child's own content.
    if ((dot || live) && isValidElement(children)) {
      const child = children as ReactElement<{ children?: ReactNode }>;
      content = cloneElement(
        child,
        undefined,
        <span className="ui-badge-dot" aria-hidden="true" />,
        child.props.children,
      );
    }
    return (
      <Slot ref={ref as never} className={classes} data-live={live || undefined} {...props}>
        {content}
      </Slot>
    );
  }
  return (
    <span ref={ref} className={classes} data-live={live || undefined} {...props}>
      {(dot || live) && <span className="ui-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
});

export interface BadgeAnchorProps extends HTMLAttributes<HTMLSpanElement> {}

/**
 * Pins a Badge to the top-right corner of the element beside it
 * (an icon button, an avatar):
 * `<BadgeAnchor><Button icon aria-label="Inbox" /><Badge variant="destructive" solid size="sm">3</Badge></BadgeAnchor>`
 */
export const BadgeAnchor = forwardRef<HTMLSpanElement, BadgeAnchorProps>(function BadgeAnchor(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-badge-anchor', className)} {...props} />;
});
