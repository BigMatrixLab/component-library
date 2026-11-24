'use client';

import { useMemo } from 'react';
import { getPaginationRange, type PaginationRangeItem, type PaginationRangeOptions } from '../lib/pagination-range';

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
