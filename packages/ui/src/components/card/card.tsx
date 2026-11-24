import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';

export type CardVariant = 'default' | 'interactive' | 'muted' | 'inset';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `default`: 1px border, no shadow. `interactive`: lifts and strengthens its border on hover
   * (use with `asChild` on a link). `muted`: a quiet filled well. `inset`: a muted card nested
   * inside another card, with a concentric corner radius.
   */
  variant?: CardVariant;
  /** Render the child element instead (e.g. a Next.js `<Link>`), keeping card styles. */
  asChild?: boolean;
}

/**
 * Card — a contained group of content and actions. Server Component–safe.
 * Compose: CardHeader (CardTitle, CardDescription, CardAction), CardContent, CardFooter.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', asChild = false, className, ...props },
  ref,
) {
  const classes = cn('ui-card', variant !== 'default' && `ui-card-${variant}`, className);
  if (asChild) return <Slot ref={ref as never} className={classes} {...props} />;
  return <div ref={ref} className={classes} {...props} />;
});

/** Title, description and an optional top-right `CardAction`. */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card-header', className)} {...props} />;
});

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading element. Pick the level that fits the page outline; `div` for no heading. Default `h3`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: Tag = 'h3', className, ...props },
  ref,
) {
  return <Tag ref={ref as never} className={cn('ui-card-title', className)} {...props} />;
});

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function CardDescription(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn('ui-card-description', className)} {...props} />;
});

/** Top-right slot of the header: a button, a menu trigger or a badge. */
export const CardAction = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardAction(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card-action', className)} {...props} />;
});

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card-content', className)} {...props} />;
});

/** Actions or meta along the bottom. */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-card-footer', className)} {...props} />;
});
