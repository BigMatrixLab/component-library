'use client';

import { forwardRef, useMemo, type ForwardedRef, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { cn } from '../../lib/cn';
import { Checkbox } from '../checkbox';
import { Skeleton } from '../skeleton';
import { Button } from '../button';
import { Icon } from '../../icons/icon';
import { Table, TableBody, TableCaption, TableCell, TableRow } from '../table';
import { DataTableBulkBar } from './data-table-bulk-bar';
import { DataTableHead } from './data-table-head';
import { DataTablePagination } from './data-table-pagination';
import { DataTableColumnsMenu, DataTableSearch, DataTableToolbar } from './data-table-toolbar';
import type { DataTableColumn, DataTableSort } from './types';
import {
  dataTableDeselectIds,
  dataTableFilterRows,
  dataTableNextDirection,
  dataTablePaginate,
  dataTableSelectIds,
  dataTableSortRows,
  dataTableToggleId,
  dataTableToText,
} from './utils';

export interface DataTableBulkApi<T> {
  selectedRows: T[];
  selectedIds: string[];
  clearSelection: () => void;
}

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  columns: DataTableColumn<T>[];
  data: readonly T[];
  /** Stable id per row (selection, keys). Default: `row.id`, else the row's index. */
  getRowId?: (row: T, index: number) => string;
  /** Accessible name of the table. */
  label?: string;
  /** Visible caption under the table. */
  caption?: ReactNode;
  /** Singular noun for counts: "payment" → "42 payments". Default "row". */
  rowLabel?: string;

  /** Table look (see Table). */
  striped?: boolean;
  compact?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;

  /** Show a global search field. Default true. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Debounce before the query is applied, in ms. Default 200. */
  searchDebounce?: number;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;

  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;

  /** Per-column filter values, keyed by column id. */
  columnFilters?: Record<string, string>;
  defaultColumnFilters?: Record<string, string>;
  onColumnFiltersChange?: (filters: Record<string, string>) => void;

  /** Adds a checkbox column. */
  selectable?: boolean;
  /** Selected row ids. */
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
  /** Accessible name of a row checkbox, e.g. `(row) => \`Select ${row.customer}\``. */
  selectRowLabel?: (row: T) => string;
  /** Content of the floating bar that appears while rows are selected. */
  bulkActions?: (api: DataTableBulkApi<T>) => ReactNode;

  /** Paginate rows. Default true. */
  paginated?: boolean;
  /** 1-based page. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Choices in the rows-per-page select. Default [10, 25, 50]. */
  pageSizeOptions?: number[];

  /** Show the "Columns" visibility menu. Default true. */
  columnsMenu?: boolean;
  /** Visibility by column id (missing ids follow the column's `hidden`). */
  columnVisibility?: Record<string, boolean>;
  defaultColumnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;

  /** Shows skeleton rows instead of data. */
  loading?: boolean;
  /** Replaces the default "No results" message. */
  emptyState?: ReactNode;
  /** Extra controls in the toolbar, before the Columns menu. */
  toolbar?: ReactNode;
}

const NO_FILTERS: Record<string, string> = {};
const NO_VISIBILITY: Record<string, boolean> = {};
const NO_IDS: string[] = [];
const DEFAULT_SIZES = [10, 25, 50];

function defaultRowId(row: unknown, index: number): string {
  const id = (row as { id?: unknown } | null)?.id;
  return id !== undefined && id !== null ? String(id) : String(index);
}

function readValue<T>(column: DataTableColumn<T>, row: T): unknown {
  const { accessor } = column;
  if (typeof accessor === 'function') return accessor(row);
  if (accessor !== undefined) return row[accessor];
  return undefined;
}

function DataTableInner<T>(props: DataTableProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  const {
    columns,
    data,
    getRowId = defaultRowId,
    label,
    caption,
    rowLabel = 'row',
    striped,
    compact,
    bordered,
    stickyHeader,
    maxHeight,
    searchable = true,
    searchPlaceholder = 'Search',
    searchDebounce = 200,
    search: searchProp,
    defaultSearch = '',
    onSearchChange,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    columnFilters: filtersProp,
    defaultColumnFilters = NO_FILTERS,
    onColumnFiltersChange,
    selectable = false,
    selectedRowIds: selectedProp,
    defaultSelectedRowIds = NO_IDS,
    onSelectedRowIdsChange,
    selectRowLabel,
    bulkActions,
    paginated = true,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    pageSize: pageSizeProp,
    defaultPageSize,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_SIZES,
    columnsMenu = true,
    columnVisibility: visibilityProp,
    defaultColumnVisibility = NO_VISIBILITY,
    onColumnVisibilityChange,
    loading = false,
    emptyState,
    toolbar,
    className,
    ...rest
  } = props;

  const [search, setSearch] = useControllableState({ value: searchProp, defaultValue: defaultSearch, onChange: onSearchChange });
  const [sort, setSort] = useControllableState<DataTableSort | null>({ value: sortProp, defaultValue: defaultSort, onChange: onSortChange });
  const [filters, setFilters] = useControllableState({ value: filtersProp, defaultValue: defaultColumnFilters, onChange: onColumnFiltersChange });
  const [selectedIds, setSelectedIds] = useControllableState({ value: selectedProp, defaultValue: defaultSelectedRowIds, onChange: onSelectedRowIdsChange });
  const [page, setPage] = useControllableState({ value: pageProp, defaultValue: defaultPage, onChange: onPageChange });
  const [pageSizeState, setPageSize] = useControllableState({
    value: pageSizeProp,
    defaultValue: defaultPageSize ?? pageSizeOptions[0] ?? 10,
    onChange: onPageSizeChange,
  });
  const [visibility, setVisibility] = useControllableState({ value: visibilityProp, defaultValue: defaultColumnVisibility, onChange: onColumnVisibilityChange });

  const pageSize = paginated ? pageSizeState : Infinity;

  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const column of columns) out[column.id] = column.label ?? (typeof column.header === 'string' ? column.header : column.id);
    return out;
  }, [columns]);

  const visibleColumns = useMemo(() => columns.filter((c) => visibility[c.id] ?? !c.hidden), [columns, visibility]);

  /* ---- derive rows: filter → sort → paginate ---- */
  const processed = useMemo(() => {
    const searchColumns = columns.filter((c) => c.searchable !== false && (c.accessor !== undefined || c.searchText));
    const predicates: Array<(row: T) => boolean> = [];
    for (const column of columns) {
      const value = (filters[column.id] ?? '').trim();
      if (!value) continue;
      if (column.filterFn) {
        const fn = column.filterFn;
        predicates.push((row) => fn(row, value));
      } else {
        const needle = value.toLowerCase();
        predicates.push((row) => dataTableToText(readValue(column, row)).toLowerCase().includes(needle));
      }
    }
    const filtered = dataTableFilterRows(data, {
      search,
      predicates,
      getSearchText: (row) =>
        searchColumns.map((c) => (c.searchText ? c.searchText(row) : dataTableToText(readValue(c, row)))).join(' '),
    });
    const sortColumn = sort ? columns.find((c) => c.id === sort.id) : undefined;
    if (!sort || !sortColumn) return filtered;
    return dataTableSortRows(filtered, {
      direction: sort.direction,
      compare: sortColumn.compare,
      getValue: (row) => readValue(sortColumn, row),
    });
  }, [columns, data, filters, search, sort]);

  const pageInfo = useMemo(() => dataTablePaginate(processed, page, pageSize), [processed, page, pageSize]);

  /* ---- selection ---- */
  const idByRow = useMemo(() => {
    const map = new Map<T, string>();
    data.forEach((row, index) => map.set(row, getRowId(row, index)));
    return map;
  }, [data, getRowId]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pageIds = pageInfo.rows.map((row, index) => idByRow.get(row) ?? String(index));
  const pageSelectedCount = pageIds.filter((id) => selectedSet.has(id)).length;
  const selectedRows = useMemo(
    () => (selectable ? data.filter((row) => selectedSet.has(idByRow.get(row) ?? '')) : []),
    [selectable, data, selectedSet, idByRow],
  );
  const clearSelection = () => setSelectedIds([]);

  /* ---- handlers ---- */
  const handleSort = (columnId: string) => {
    const current = sort && sort.id === columnId ? sort.direction : null;
    const next = dataTableNextDirection(current);
    setSort(next ? { id: columnId, direction: next } : null);
    setPage(1);
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFilter = (columnId: string, value: string) => {
    setFilters({ ...filters, [columnId]: value });
    setPage(1);
  };
  const filtersActive = search.trim() !== '' || Object.values(filters).some((v) => v.trim() !== '');
  const clearFilters = () => {
    setSearch('');
    setFilters({});
    setPage(1);
  };

  const columnMenuItems = columns
    .filter((c) => c.hideable !== false)
    .map((c) => {
      const visible = visibility[c.id] ?? !c.hidden;
      return { id: c.id, label: labels[c.id], visible, disabled: visible && visibleColumns.length <= 1 };
    });
  const showColumnsMenu = columnsMenu && columnMenuItems.length > 0;
  const showToolbar = searchable || showColumnsMenu || toolbar != null;

  const colSpan = visibleColumns.length + (selectable ? 1 : 0);
  const plural = `${rowLabel}s`;
  const skeletonRows = Math.min(Number.isFinite(pageSize) ? pageSize : 10, 10);
  const sortLabel = sort ? labels[sort.id] : undefined;
  const announcement = loading
    ? 'Loading'
    : `${processed.length} ${processed.length === 1 ? rowLabel : plural}${
        sort && sortLabel ? `, sorted by ${sortLabel} ${sort.direction === 'asc' ? 'ascending' : 'descending'}` : ''
      }`;
  const summary = selectable && selectedRows.length > 0 ? `${selectedRows.length} of ${data.length} selected` : undefined;

  return (
    <div ref={ref} className={cn('ui-data-table', className)} {...rest}>
      {showToolbar && (
        <DataTableToolbar>
          {searchable ? (
            <DataTableSearch
              value={search}
              onValueChange={handleSearch}
              placeholder={searchPlaceholder}
              label={`Search ${plural}`}
              debounce={searchDebounce}
            />
          ) : (
            <span />
          )}
          <div className="ui-data-table-toolbar-end">
            {toolbar}
            {showColumnsMenu && (
              <DataTableColumnsMenu
                columns={columnMenuItems}
                onVisibleChange={(id, visible) => setVisibility({ ...visibility, [id]: visible })}
              />
            )}
          </div>
        </DataTableToolbar>
      )}

      <Table
        label={label}
        aria-label={label}
        aria-busy={loading || undefined}
        striped={striped}
        compact={compact}
        bordered={bordered}
        stickyHeader={stickyHeader}
        maxHeight={maxHeight}
      >
        {caption != null && <TableCaption>{caption}</TableCaption>}
        <DataTableHead
          columns={visibleColumns}
          labels={labels}
          sort={sort}
          onSort={handleSort}
          selectable={selectable}
          allSelected={pageIds.length > 0 && pageSelectedCount === pageIds.length}
          someSelected={pageSelectedCount > 0}
          disableSelectAll={loading || pageIds.length === 0}
          onToggleAll={(checked) => setSelectedIds(checked ? dataTableSelectIds(selectedIds, pageIds) : dataTableDeselectIds(selectedIds, pageIds))}
          filters={filters}
          onFilterChange={handleFilter}
        />
        <TableBody>
          {loading &&
            Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} aria-hidden="true">
                {selectable && (
                  <TableCell className="ui-data-table-select">
                    <Skeleton width={16} height={16} />
                  </TableCell>
                )}
                {visibleColumns.map((column, colIndex) => (
                  <TableCell key={column.id} align={column.align}>
                    <Skeleton
                      width={`${55 + ((rowIndex * 7 + colIndex * 13) % 35)}%`}
                      height={14}
                      className={column.align === 'right' ? 'ui-data-table-skeleton-end' : undefined}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading && pageInfo.rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={Math.max(colSpan, 1)} className="ui-data-table-empty">
                {emptyState ?? (
                  <div className="ui-data-table-empty-content">
                    <span className="ui-data-table-empty-icon" aria-hidden="true">
                      <Icon name="search" size={18} />
                    </span>
                    <p className="ui-data-table-empty-title">No {plural} found</p>
                    <p className="ui-data-table-empty-text">
                      {filtersActive ? 'Try a different search or clear the filters.' : `There are no ${plural} to show yet.`}
                    </p>
                    {filtersActive && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            pageInfo.rows.map((row, index) => {
              const rowId = pageIds[index];
              const selected = selectedSet.has(rowId);
              return (
                <TableRow key={rowId} selected={selected}>
                  {selectable && (
                    <TableCell className="ui-data-table-select">
                      <Checkbox
                        size="sm"
                        aria-label={selectRowLabel ? selectRowLabel(row) : 'Select row'}
                        checked={selected}
                        onCheckedChange={() => setSelectedIds(dataTableToggleId(selectedIds, rowId))}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => {
                    const value = readValue(column, row);
                    return (
                      <TableCell key={column.id} align={column.align} numeric={column.align === 'right'} className={column.className}>
                        {column.cell ? column.cell({ row, value, index, rowId }) : dataTableToText(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      {paginated && (
        <DataTablePagination
          page={pageInfo.page}
          pageCount={pageInfo.pageCount}
          from={pageInfo.from}
          to={pageInfo.to}
          total={pageInfo.total}
          pageSize={pageSizeState}
          pageSizeOptions={pageSizeOptions}
          rowLabel={rowLabel}
          summary={summary}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
      {!paginated && summary && <p className="ui-data-table-range">{summary}</p>}

      {selectable && bulkActions && (
        <DataTableBulkBar count={selectedRows.length} onClear={clearSelection}>
          {selectedRows.length > 0 ? bulkActions({ selectedRows, selectedIds, clearSelection }) : null}
        </DataTableBulkBar>
      )}

      <div className="ui-data-table-live" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}

/**
 * DataTable — a Table with sorting, search, per-column filters, row selection,
 * pagination, column visibility, empty and loading states. Every piece of state is
 * controlled or uncontrolled. Rows are derived by small pure helpers (filter → sort → paginate).
 */
export const DataTable = forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;
