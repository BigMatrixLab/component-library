'use client';

import { Icon } from '../../icons/icon';
import { Checkbox } from '../checkbox';
import { TableCell, TableHead, TableHeader, TableRow } from '../table';
import type { DataTableColumn, DataTableSort } from './types';

export interface DataTableHeadProps<T> {
  columns: DataTableColumn<T>[];
  labels: Record<string, string>;
  sort: DataTableSort | null;
  onSort: (columnId: string) => void;
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  disableSelectAll: boolean;
  onToggleAll: (checked: boolean) => void;
  filters: Record<string, string>;
  onFilterChange: (columnId: string, value: string) => void;
}

/** Header rows: titles (with sort buttons), then the optional per-column filter row. */
export function DataTableHead<T>({
  columns,
  labels,
  sort,
  onSort,
  selectable,
  allSelected,
  someSelected,
  disableSelectAll,
  onToggleAll,
  filters,
  onFilterChange,
}: DataTableHeadProps<T>) {
  const hasFilters = columns.some((column) => column.filter);
  return (
    <TableHeader>
      <TableRow>
        {selectable && (
          <TableHead className="ui-data-table-select">
            <Checkbox
              size="sm"
              aria-label="Select all rows on this page"
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              disabled={disableSelectAll}
              onCheckedChange={onToggleAll}
            />
          </TableHead>
        )}
        {columns.map((column) => {
          const direction = sort && sort.id === column.id ? sort.direction : null;
          return (
            <TableHead
              key={column.id}
              align={column.align}
              className={column.headerClassName}
              style={column.width !== undefined ? { width: column.width } : undefined}
              aria-sort={column.sortable ? (direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none') : undefined}
            >
              {column.sortable ? (
                <button
                  type="button"
                  className="ui-data-table-sort"
                  data-direction={direction ?? undefined}
                  onClick={() => onSort(column.id)}
                >
                  <span>{column.header}</span>
                  <Icon
                    key={direction ?? 'none'}
                    name={direction === 'asc' ? 'arrow-up' : direction === 'desc' ? 'arrow-down' : 'chevrons-up-down'}
                    size={14}
                    className="ui-data-table-sort-icon"
                  />
                </button>
              ) : (
                column.header
              )}
            </TableHead>
          );
        })}
      </TableRow>
      {hasFilters && (
        <TableRow className="ui-data-table-filter-row">
          {selectable && <TableCell className="ui-data-table-select" />}
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align}>
              {column.filter?.({
                value: filters[column.id] ?? '',
                onChange: (value) => onFilterChange(column.id, value),
                label: labels[column.id] ?? column.id,
              })}
            </TableCell>
          ))}
        </TableRow>
      )}
    </TableHeader>
  );
}
