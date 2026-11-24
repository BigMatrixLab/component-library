import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { Icon } from '../../icons/icon';

export type BreadcrumbSeparatorStyle = 'chevron' | 'slash';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Glyph between items: a chevron (default) or a slash. */
  separator?: BreadcrumbSeparatorStyle;
}

/**
 * Breadcrumb — where the current page sits in the hierarchy. A `<nav>` with an
 * ordered list; the last item is the current page. Server Component–safe.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator = 'chevron', className, ...props },
  ref,
) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" data-separator={separator} className={cn('ui-breadcrumb', className)} {...props} />
  );
});

export const BreadcrumbList = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(function BreadcrumbList(
  { className, ...props },
  ref,
) {
  return <ol ref={ref} className={cn('ui-breadcrumb-list', className)} {...props} />;
});

export const BreadcrumbItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function BreadcrumbItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} className={cn('ui-breadcrumb-item', className)} {...props} />;
});

export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child element (e.g. a Next.js `<Link>`) with the breadcrumb link styles. */
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(function BreadcrumbLink(
  { asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  return <Comp ref={ref as never} className={cn('ui-breadcrumb-link', className)} {...props} />;
});

/** The current page: not a link, announced with `aria-current="page"`. */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function BreadcrumbPage(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('ui-breadcrumb-page', className)}
      {...props}
    />
  );
});

/**
 * The glyph between two items. Without children it follows the `separator`
 * style of the parent `<Breadcrumb>`.
 */
export const BreadcrumbSeparator = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function BreadcrumbSeparator(
  { className, children, ...props },
  ref,
) {
  return (
    <li ref={ref} role="presentation" aria-hidden="true" className={cn('ui-breadcrumb-separator', className)} {...props}>
      {children ?? (
        <>
          <Icon name="chevron-right" size={14} className="ui-breadcrumb-chevron" />
          <span className="ui-breadcrumb-slash">/</span>
        </>
      )}
    </li>
  );
});

/**
 * A collapsed middle section. It is a button, so it can open a menu:
 *   <DropdownMenu><DropdownMenuTrigger asChild><BreadcrumbEllipsis /></DropdownMenuTrigger>…
 */
export const BreadcrumbEllipsis = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function BreadcrumbEllipsis({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Show hidden pages"
        className={cn('ui-breadcrumb-ellipsis', className)}
        {...props}
      >
        <Icon name="more-horizontal" size={16} />
      </button>
    );
  },
);
