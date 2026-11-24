'use client';

import { useMemo } from 'react';

export type PaginationRangeItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface PaginationRangeOptions {
  /** Current page, 1-based. */
  page: number;
  /** Total number of pages. */
  total: number;
  /** Pages shown on each side of the current page. Default 1. */
  siblings?: number;
  /** Pages always shown at each end. Default 1. */
  boundaries?: number;
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/**
 * The list of page numbers and ellipses to render. The length stays constant
 * while paging, so the control never changes width.
 *   getPaginationRange({ page: 6, total: 12 }) → [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 12]
 */
export function getPaginationRange({
  page,
  total,
  siblings = 1,
  boundaries = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  const last = Math.max(1, Math.floor(total));
  const current = Math.min(Math.max(1, Math.floor(page)), last);
  const slots = siblings * 2 + boundaries * 2 + 3;
  if (last <= slots) return range(1, last);

  const left = Math.max(current - siblings, boundaries + 1);
  const right = Math.min(current + siblings, last - boundaries);
  const showLeft = left > boundaries + 2;
  const showRight = right < last - boundaries - 1;
  const start = range(1, boundaries);
  const end = range(last - boundaries + 1, last);
  const edge = siblings * 2 + boundaries + 2;

  if (!showLeft && showRight) return [...range(1, edge), 'ellipsis-end', ...end];
  if (showLeft && !showRight) return [...start, 'ellipsis-start', ...range(last - edge + 1, last)];
  return [...start, 'ellipsis-start', ...range(left, right), 'ellipsis-end', ...end];
}

/**
 * usePagination — the page list for a pagination control.
 *   const pages = usePagination({ page, total: 12 });
 */
export function usePagination({
  page,
  total,
  siblings = 1,
  boundaries = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  return useMemo(() => getPaginationRange({ page, total, siblings, boundaries }), [page, total, siblings, boundaries]);
}
