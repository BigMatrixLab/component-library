import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Slot } from '../../lib/slot';
import { Icon } from '../../icons/icon';

export const Pagination = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Pagination(
  { className, ...props },
  ref,
) {
  return <nav ref={ref} aria-label="Pagination" className={cn('ui-pagination', className)} {...props} />;
});

export const PaginationContent = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function PaginationContent(
  { className, ...props },
  ref,
) {
  return <ul ref={ref} className={cn('ui-pagination-content', className)} {...props} />;
});

export const PaginationItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function PaginationItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} className={cn('ui-pagination-item', className)} {...props} />;
});

export interface PaginationLinkProps extends HTMLAttributes<HTMLElement> {
  /** Renders an `<a>` when set, otherwise a `<button>`. */
  href?: string;
  /** The current page: `aria-current="page"` and the filled style. */
  isActive?: boolean;
  /** Not available (first / last page). Stays in the layout, ignores clicks. */
  disabled?: boolean;
  /** `icon` is a square (page numbers); `default` has room for a label. */
  size?: 'icon' | 'default';
  /** Render the child element (e.g. a Next.js `<Link>`) with the pagination styles. */
  asChild?: boolean;
  target?: string;
  rel?: string;
  children?: ReactNode;
}

/** One page number (or any link in the control). */
export const PaginationLink = forwardRef<HTMLElement, PaginationLinkProps>(function PaginationLink(
  { isActive, disabled, size = 'icon', asChild, href, className, onClick, children, ...props },
  ref,
) {
  const Comp: ElementType = asChild ? Slot : href !== undefined ? 'a' : 'button';
  const isButton = Comp === 'button';
  return (
    <Comp
      ref={ref}
      href={href}
      type={isButton ? 'button' : undefined}
      disabled={isButton ? disabled : undefined}
      aria-disabled={disabled && !isButton ? true : undefined}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={disabled && !isButton ? -1 : undefined}
      data-active={isActive ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn('ui-pagination-link', size === 'default' && 'ui-pagination-link-wide', className)}
      onClick={(e: MouseEvent<HTMLElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Comp>
  );
});

export const PaginationPrevious = forwardRef<HTMLElement, PaginationLinkProps>(function PaginationPrevious(
  { children, asChild, ...props },
  ref,
) {
  return (
    <PaginationLink ref={ref} size="default" asChild={asChild} aria-label="Go to previous page" {...props}>
      {asChild ? (
        children
      ) : (
        <>
          <Icon name="chevron-left" size={16} />
          <span className="ui-pagination-label">{children ?? 'Previous'}</span>
        </>
      )}
    </PaginationLink>
  );
});

export const PaginationNext = forwardRef<HTMLElement, PaginationLinkProps>(function PaginationNext(
  { children, asChild, ...props },
  ref,
) {
  return (
    <PaginationLink ref={ref} size="default" asChild={asChild} aria-label="Go to next page" {...props}>
      {asChild ? (
        children
      ) : (
        <>
          <span className="ui-pagination-label">{children ?? 'Next'}</span>
          <Icon name="chevron-right" size={16} />
        </>
      )}
    </PaginationLink>
  );
});

/** The "…" between page numbers. Decorative; assistive tech reads "More pages". */
export const PaginationEllipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function PaginationEllipsis(
  { className, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn('ui-pagination-ellipsis', className)} {...props}>
      <Icon name="more-horizontal" size={16} />
      <span className="sr-only">More pages</span>
    </span>
  );
});

export interface PaginationStatusProps extends HTMLAttributes<HTMLSpanElement> {
  page: number;
  total: number;
}

/** Compact "Page 3 of 12" text for the small variant. Announced politely when the page changes. */
export const PaginationStatus = forwardRef<HTMLSpanElement, PaginationStatusProps>(function PaginationStatus(
  { page, total, className, ...props },
  ref,
) {
  return (
    <span ref={ref} aria-live="polite" className={cn('ui-pagination-status', className)} {...props}>
      Page <strong>{page}</strong> of {total}
    </span>
  );
});
