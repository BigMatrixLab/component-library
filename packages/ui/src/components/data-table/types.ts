import type { ReactNode } from 'react';
import type { TableAlign } from '../table';

export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableSort {
  /** Column id. */
  id: string;
  direction: DataTableSortDirection;
}

export interface DataTableCellContext<T> {
  row: T;
  /** The raw value read through `accessor` (undefined without one). */
  value: unknown;
  /** Index of the row within the current page. */
  index: number;
  rowId: string;
}

export interface DataTableFilterContext {
  value: string;
  onChange: (value: string) => void;
  /** Plain-text column name, for aria-labels. */
  label: string;
}

export interface DataTableColumn<T> {
  /** Unique, stable id (used for sort, filters and visibility state). */
  id: string;
  /** Header content. */
  header: ReactNode;
  /** Plain-text name for the columns menu and announcements. Defaults to `header` when it is a string. */
  label?: string;
  /** A key of the row, or a function returning the value shown, sorted and searched. */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell. Without it the accessor value is rendered as text. */
  cell?: (context: DataTableCellContext<T>) => ReactNode;
  /** Header becomes a sort button (asc → desc → none). */
  sortable?: boolean;
  /** Custom comparator, ascending. Defaults to numbers, dates and natural string order. */
  compare?: (a: T, b: T) => number;
  /** Include in the global search. Default true when the column has an accessor. */
  searchable?: boolean;
  /** Text the global search matches for this column. Defaults to the accessor value. */
  searchText?: (row: T) => string;
  /** Per-column filter control, rendered under the header. Pair with `filterFn` or use the default contains-match. */
  filter?: (context: DataTableFilterContext) => ReactNode;
  /** Does the row pass this column's filter value? Default: case-insensitive "contains" on the accessor value. */
  filterFn?: (row: T, filterValue: string) => boolean;
  align?: TableAlign;
  /** Column width (number is px). */
  width?: number | string;
  /** Hidden initially (the columns menu can show it). */
  hidden?: boolean;
  /** Offer this column in the columns menu. Default true. */
  hideable?: boolean;
  className?: string;
  headerClassName?: string;
}
