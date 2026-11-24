import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

export type TableAlign = 'left' | 'center' | 'right';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Alternate row tint. */
  striped?: boolean;
  /** Tighter rows (36px instead of 48px). */
  compact?: boolean;
  /** A hairline between columns as well as rows. */
  bordered?: boolean;
  /** Keeps the header row visible while the body scrolls. Pair with `maxHeight`. */
  stickyHeader?: boolean;
  /** Height at which the table body starts scrolling (number is px). */
  maxHeight?: number | string;
  /** Accessible name of the scroll region (recommended for wide tables). */
  label?: string;
  /** Class for the bordered scroll wrapper. */
  wrapperClassName?: string;
}

/**
 * Table — a native `<table>` inside a rounded, scrollable wrapper. The wrapper is
 * focusable so keyboard users can scroll it. Server Component–safe.
 * Compose: TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { striped, compact, bordered, stickyHeader, maxHeight, label, wrapperClassName, className, ...props },
  ref,
) {
  const style: CSSProperties | undefined = maxHeight !== undefined ? { maxHeight } : undefined;
  return (
    <div
      className={cn('ui-table-wrap', wrapperClassName)}
      style={style}
      tabIndex={0}
      role={label ? 'region' : undefined}
      aria-label={label}
    >
      <table
        ref={ref}
        className={cn(
          'ui-table',
          striped && 'ui-table-striped',
          compact && 'ui-table-compact',
          bordered && 'ui-table-bordered',
          stickyHeader && 'ui-table-sticky',
          className,
        )}
        {...props}
      />
    </div>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(
  { className, ...props },
  ref,
) {
  return <thead ref={ref} className={cn('ui-table-header', className)} {...props} />;
});

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className, ...props },
  ref,
) {
  return <tbody ref={ref} className={cn('ui-table-body', className)} {...props} />;
});

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableFooter(
  { className, ...props },
  ref,
) {
  return <tfoot ref={ref} className={cn('ui-table-footer', className)} {...props} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Tints the row as selected (`data-state="selected"`). */
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...props },
  ref,
) {
  return <tr ref={ref} className={cn('ui-table-row', className)} data-state={selected ? 'selected' : undefined} {...props} />;
});

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Right-aligns and uses tabular figures. Same as `align="right"`. */
  numeric?: boolean;
  align?: TableAlign;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { numeric, align, scope = 'col', className, ...props },
  ref,
) {
  return (
    <th
      ref={ref}
      scope={scope}
      className={cn('ui-table-head', className)}
      data-align={align ?? (numeric ? 'right' : undefined)}
      data-numeric={numeric ? '' : undefined}
      {...props}
    />
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-aligns and uses tabular figures. Same as `align="right"`. */
  numeric?: boolean;
  align?: TableAlign;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric, align, className, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={cn('ui-table-cell', className)}
      data-align={align ?? (numeric ? 'right' : undefined)}
      data-numeric={numeric ? '' : undefined}
      {...props}
    />
  );
});

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption(
  { className, ...props },
  ref,
) {
  return <caption ref={ref} className={cn('ui-table-caption', className)} {...props} />;
});
