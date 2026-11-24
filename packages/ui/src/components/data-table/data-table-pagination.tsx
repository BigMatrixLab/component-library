'use client';

import { useId } from 'react';
import { Icon } from '../../icons/icon';
import { Button } from '../button';
import { NativeSelect } from '../native-select';

export interface DataTablePaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  rowLabel: string;
  /** Text shown on the left after the range, e.g. "3 of 42 selected". */
  summary?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Range text, rows-per-page select and previous / next buttons. */
export function DataTablePagination({
  page,
  pageCount,
  from,
  to,
  total,
  pageSize,
  pageSizeOptions,
  rowLabel,
  summary,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const selectId = useId();
  return (
    <div className="ui-data-table-pagination">
      <p className="ui-data-table-range">
        {total === 0 ? `No ${rowLabel}s` : `Showing ${from}–${to} of ${total}`}
        {summary ? <span className="ui-data-table-summary"> · {summary}</span> : null}
      </p>
      <div className="ui-data-table-pager">
        {pageSizeOptions.length > 1 && (
          <div className="ui-data-table-page-size">
            <label htmlFor={selectId}>Rows per page</label>
            <NativeSelect
              id={selectId}
              size="sm"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}
        <span className="ui-data-table-page-label">
          Page {page} of {pageCount}
        </span>
        <div className="ui-data-table-pager-buttons">
          <Button
            variant="outline"
            size="sm"
            icon
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="chevron-left" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <Icon name="chevron-right" />
          </Button>
        </div>
      </div>
    </div>
  );
}
