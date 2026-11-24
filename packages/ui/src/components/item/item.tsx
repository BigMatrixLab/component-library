import { Children, forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'sm' | 'md' | 'lg';

export interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  /** `default`: no container. `outline`: 1px border. `muted`: a quiet filled well. Default `default`. */
  variant?: ItemVariant;
  /** Padding and text size: compact / regular / roomy. Default `md`. */
  size?: ItemSize;
  /** Render the child element instead (e.g. a Next.js `<Link>`); links and buttons get hover and focus styles. */
  asChild?: boolean;
}

/**
 * Item — one row: media, title and description, actions, trailing meta. Server Component–safe.
 * Compose: ItemMedia, ItemContent (ItemTitle, ItemDescription), ItemMeta, ItemActions.
 */
export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { variant = 'default', size = 'md', asChild = false, className, ...props },
  ref,
) {
  const classes = cn('ui-item', variant !== 'default' && `ui-item-${variant}`, size !== 'md' && `ui-item-${size}`, className);
  if (asChild) return <Slot ref={ref as never} className={classes} {...props} />;
  return <div ref={ref} className={classes} {...props} />;
});

export type ItemMediaVariant = 'default' | 'icon' | 'image';

export interface ItemMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** `default`: as is (an `Avatar`, a custom node). `icon`: an `Icon` in a soft tile. `image`: a rounded thumbnail. Default `default`. */
  variant?: ItemMediaVariant;
}

export const ItemMedia = forwardRef<HTMLDivElement, ItemMediaProps>(function ItemMedia(
  { variant = 'default', className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-item-media', variant !== 'default' && `ui-item-media-${variant}`, className)} {...props} />;
});

/** Title and description, stacked; takes the remaining width and truncates. */
export const ItemContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ItemContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-item-content', className)} {...props} />;
});

export const ItemTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ItemTitle(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-item-title', className)} {...props} />;
});

export const ItemDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function ItemDescription(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-item-description', className)} {...props} />;
});

/** Quiet trailing text: a date, a size, a value. Tabular numerals. */
export const ItemMeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ItemMeta(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-item-meta', className)} {...props} />;
});

/** Buttons, a switch or a menu trigger at the end of the row. */
export const ItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ItemActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-item-actions', className)} {...props} />;
});

export interface ItemGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Draw the group as one container: `outline` (border) or `muted` (filled). Default `default` (no container). */
  variant?: ItemVariant;
  /** Hairline dividers between rows. Default `true`. */
  divided?: boolean;
}

/**
 * A list of `Item`s with dividers. Each child is wrapped in a `role="listitem"` cell, so the
 * group is a real list even when an `Item` is a link (`asChild`).
 */
export const ItemGroup = forwardRef<HTMLDivElement, ItemGroupProps>(function ItemGroup(
  { variant = 'default', divided = true, className, children, role = 'list', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={cn('ui-item-group', variant !== 'default' && `ui-item-group-${variant}`, !divided && 'ui-item-group-flush', className)}
      {...props}
    >
      {Children.toArray(children).map((child, i) => (
        <div key={i} role="listitem" className="ui-item-cell">
          {child}
        </div>
      ))}
    </div>
  );
});
