import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type EmptyVariant = 'default' | 'dashed' | 'card';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `default`: no container, sits inside whatever surface holds it (a card, a table body).
   * `dashed`: a dashed outline that invites an action (drop zones, "add the first…").
   * `card`: a solid bordered surface of its own. Default `default`.
   */
  variant?: EmptyVariant;
}

/**
 * Empty — what to show when there is nothing yet. Server Component–safe.
 * Compose: EmptyHeader (EmptyMedia, EmptyTitle, EmptyDescription), EmptyActions.
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { variant = 'default', className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-empty', variant !== 'default' && `ui-empty-${variant}`, className)} {...props} />;
});

/** Groups the media, title and description so they sit close together. */
export const EmptyHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function EmptyHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-empty-header', className)} {...props} />;
});

export type EmptyMediaVariant = 'icon' | 'illustration';

export interface EmptyMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** `icon`: puts an `Icon` in a soft rounded tile. `illustration`: a free slot for an image or SVG. Default `icon`. */
  variant?: EmptyMediaVariant;
}

export const EmptyMedia = forwardRef<HTMLDivElement, EmptyMediaProps>(function EmptyMedia(
  { variant = 'icon', className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-empty-media', `ui-empty-media-${variant}`, className)} {...props} />;
});

export interface EmptyTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading element. Pick the level that fits the page outline; `div` for no heading. Default `h3`. */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export const EmptyTitle = forwardRef<HTMLHeadingElement, EmptyTitleProps>(function EmptyTitle(
  { as: Tag = 'h3', className, ...props },
  ref,
) {
  return <Tag ref={ref as never} className={cn('ui-empty-title', className)} {...props} />;
});

export const EmptyDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function EmptyDescription(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-empty-description', className)} {...props} />;
});

/** The next step: one primary button, optionally a secondary one. */
export const EmptyActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function EmptyActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-empty-actions', className)} {...props} />;
});
