## Component: Data table

A table with sorting, search, per-column filters, row selection, pagination, column visibility, empty and loading states. Built on Table (see table.md), Checkbox, Button, Input, NativeSelect and DropdownMenu. Every piece of state is controlled **or** uncontrolled.

### Anatomy
```
<DataTable columns data>            .ui-data-table (flex column, gap 12px)
  toolbar                           .ui-data-table-toolbar: search (left) · extra controls + Columns menu (right)
  <Table>                           see table.md
    header row                      optional checkbox column · titles (sort buttons)
    filter row (if any column.filter)
    body                            rows · or skeleton rows (loading) · or the empty row
  pagination                        "Showing 1–10 of 42" · rows per page · "Page 1 of 5" · prev / next
  bulk bar                          floating, rises in while rows are selected
  live region                       role="status", visually hidden
```

### Column definition
`{ id, header, label?, accessor?, cell?, sortable?, compare?, searchable?, searchText?, filter?, filterFn?, align?, width?, hidden?, hideable?, className?, headerClassName? }`
- `accessor`: a key of the row, or `(row) => value`. Used for display, sort, search, filter.
- `cell({ row, value, index, rowId })`: custom render (badges, actions).
- `filter({ value, onChange, label })`: control for the filter row; `filterFn(row, value)` or a default "contains" match on the accessor value.
- `align: 'right'` right-aligns the cell and gives it tabular figures.

### Props
- Data: `columns`, `data`, `getRowId` (default `row.id`, else index), `label`, `caption`, `rowLabel` (singular noun, default "row").
- Table look: `striped`, `compact`, `bordered`, `stickyHeader`, `maxHeight`.
- Search: `searchable` (default true), `searchPlaceholder`, `searchDebounce` (200ms), `search` / `defaultSearch` / `onSearchChange`.
- Sort: `sort` / `defaultSort` / `onSortChange` — `{ id, direction: 'asc' | 'desc' } | null`.
- Filters: `columnFilters` / `defaultColumnFilters` / `onColumnFiltersChange` — `Record<columnId, string>`.
- Selection: `selectable`, `selectedRowIds` / `defaultSelectedRowIds` / `onSelectedRowIdsChange`, `selectRowLabel(row)`, `bulkActions({ selectedRows, selectedIds, clearSelection })`.
- Pagination: `paginated` (default true), `page` (1-based) / `defaultPage` / `onPageChange`, `pageSize` / `defaultPageSize` / `onPageSizeChange`, `pageSizeOptions` (default 10, 25, 50).
- Columns menu: `columnsMenu` (default true), `columnVisibility` / `defaultColumnVisibility` / `onColumnVisibilityChange`.
- States: `loading`, `emptyState`, `toolbar` (extra controls).

### Behaviour
- Pipeline: filter (search AND column filters) → sort → paginate. Pure helpers: `dataTableFilterRows`, `dataTableSortRows`, `dataTablePaginate`.
- Sort button cycles asc → desc → none. Sort is stable; empty values stay last in both directions. `aria-sort` on every sortable header (`ascending`, `descending`, `none`).
- Search commits after the debounce; Esc or the clear button empties it at once. Changing search, filters, sort or page size returns to page 1; an out-of-range page is clamped.
- Header checkbox selects every row **on the current page** (indeterminate when some are). Selection persists across pages. Footer shows "n of m selected".
- Bulk bar appears when n > 0 with the app's `bulkActions` plus a Clear button; it exits when the selection empties.
- Columns menu: checkbox items; choosing one keeps the menu open; the last visible column cannot be hidden.
- Empty: one full-width row with icon, "No {rows} found", and a "Clear filters" button when filters are active. Loading: up to 10 skeleton rows, `aria-busy` on the table.
- A polite live region announces the result count and sort.

### Visual rules
- Sort button sits flush with the cell text (−8px margin), 12px / 500, hover tint `--ui-accent`, active column `--ui-foreground`; arrow icon 14px (up, down, or up-down when unsorted at 60%).
- Selection column 44px wide. Pagination text 14px `--ui-muted-foreground`, tabular-nums.
- Bulk bar: `--ui-surface-raised`, 1px `--ui-border`, `--radius-xl`, `--ui-shadow-lg`, centred, 20px above the viewport bottom (sticky dock); wraps full-width on phones.

### Motion
- Bulk bar enters with `ui-pop-in` (380ms, rises 8px), exits with `ui-pop-out` (160ms). Empty content pops in. Sorted-arrow pops in 150ms.

### Accessibility
- Native table; checkboxes labelled ("Select all rows on this page", `selectRowLabel`). Sort controls are real buttons. Search field has an `aria-label`. Prev / next buttons labelled.

### Acceptance checks
- Click Amount: ascending, then descending, then original order; `aria-sort` follows.
- Typing in search filters after ~200ms and resets to page 1; "Showing 1–n of m" updates.
- Select-all on a page checks only that page; the bulk bar rises in; Clear removes it.
- Hiding a column removes it from header and cells; at least one stays.
- Empty search shows the empty row; `loading` shows skeletons without layout jump.
