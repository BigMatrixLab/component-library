import type { DataTableSortDirection } from './types';

/* Pure helpers behind DataTable: no React, fully unit-tested. */

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value));
}

/** Ascending comparison of two cell values. Empty values sort last; numbers, dates and booleans compare by value. */
export function dataTableCompareValues(a: unknown, b: unknown): number {
  const aNil = isNil(a);
  const bNil = isNil(b);
  if (aNil || bNil) return aNil && bNil ? 0 : aNil ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : a > b ? 1 : 0;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/** none → asc → desc → none. */
export function dataTableNextDirection(current: DataTableSortDirection | null): DataTableSortDirection | null {
  if (current === null) return 'asc';
  return current === 'asc' ? 'desc' : null;
}

export interface SortOptions<T> {
  direction: DataTableSortDirection;
  /** Value to compare. Ignored when `compare` is set. */
  getValue?: (row: T) => unknown;
  /** Custom ascending comparator. */
  compare?: (a: T, b: T) => number;
}

/** Stable sort that never mutates its input. Empty values stay last in both directions. */
export function dataTableSortRows<T>(rows: readonly T[], options: SortOptions<T> | null): T[] {
  if (!options) return rows.slice();
  const { direction, getValue, compare } = options;
  const factor = direction === 'desc' ? -1 : 1;
  const decorated = rows.map((row, index) => ({ row, index, value: compare ? undefined : getValue?.(row) }));
  decorated.sort((x, y) => {
    let result: number;
    if (compare) {
      result = compare(x.row, y.row) * factor;
    } else if (isNil(x.value) || isNil(y.value)) {
      result = dataTableCompareValues(x.value, y.value); // empties last, regardless of direction
    } else {
      result = dataTableCompareValues(x.value, y.value) * factor;
    }
    return result !== 0 ? result : x.index - y.index;
  });
  return decorated.map((d) => d.row);
}

/** Lower-cased text for a cell value (empty for null, objects and functions). */
export function dataTableToText(value: unknown): string {
  if (isNil(value)) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return '';
}

export interface FilterOptions<T> {
  /** Global search query. Every whitespace-separated word must appear (AND). */
  search?: string;
  /** Text to search for a row. */
  getSearchText?: (row: T) => string;
  /** Extra per-row tests (per-column filters); a row must pass them all. */
  predicates?: ReadonlyArray<(row: T) => boolean>;
}

export function dataTableFilterRows<T>(rows: readonly T[], { search = '', getSearchText, predicates = [] }: FilterOptions<T>): T[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0 && predicates.length === 0) return rows.slice();
  return rows.filter((row) => {
    if (!predicates.every((test) => test(row))) return false;
    if (words.length === 0) return true;
    const text = (getSearchText ? getSearchText(row) : '').toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

export interface PageResult<T> {
  rows: T[];
  /** The page actually shown (1-based, clamped into range). */
  page: number;
  pageCount: number;
  total: number;
  /** 1-based index of the first / last row shown (0 when empty). */
  from: number;
  to: number;
}

/** Slice one page. `pageSize` of 0, Infinity or less means "all rows". The page is clamped into range. */
export function dataTablePaginate<T>(rows: readonly T[], page: number, pageSize: number): PageResult<T> {
  const total = rows.length;
  const size = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : Math.max(total, 1);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * size;
  const slice = rows.slice(start, start + size);
  return {
    rows: slice,
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
  };
}

/** Add ids (without duplicates), keeping order. */
export function dataTableSelectIds(selected: readonly string[], ids: readonly string[]): string[] {
  const set = new Set(selected);
  const out = selected.slice();
  for (const id of ids) {
    if (!set.has(id)) {
      set.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Remove ids. */
export function dataTableDeselectIds(selected: readonly string[], ids: readonly string[]): string[] {
  const drop = new Set(ids);
  return selected.filter((id) => !drop.has(id));
}

/** Add the id when missing, remove it when present. */
export function dataTableToggleId(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
}
