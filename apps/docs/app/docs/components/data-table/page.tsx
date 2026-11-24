import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import PaymentsDataTable from '@/examples/data-table/payments';
import ControlledDataTable from '@/examples/data-table/controlled';

export const metadata: Metadata = { title: 'Data table' };

export default function DataTablePage() {
  return (
    <DocPage href="/docs/components/data-table" wide>
      <Section id="payments" title="Payments">
        <P>
          Forty payments with sortable headers, debounced search, row selection with a floating bulk-action bar, a columns menu, page size and “Showing 1–10 of 40”. State is uncontrolled here.
        </P>
        <Example component="data-table" file="data-table/payments" title="Payments data table" align="stretch">
          <PaymentsDataTable />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Lists people scan, compare and act on: payments, users, orders, logs.',
            <>A static, read-only grid needs no state: use <Code>Table</Code> directly.</>,
            'Server-side data: control page, sort, search and filters and feed the table the page you fetched (the helpers only operate on what you pass in).',
          ]}
        />
      </Section>

      <Section id="controlled" title="Controlled state, filters and loading">
        <P>
          Search, sort, per-column filters and the page are held by the parent. The role column renders a select in the filter row; <Code>loading</Code> swaps rows for skeletons without changing the layout.
        </P>
        <Example component="data-table" file="data-table/controlled" title="Controlled data table" align="stretch">
          <ControlledDataTable />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="DataTable"
          rows={[
            { name: 'columns', type: 'DataTableColumn<T>[]', description: 'Column definitions (see below).' },
            { name: 'data', type: 'readonly T[]', description: 'The rows.' },
            { name: 'getRowId', type: '(row, index) => string', description: 'Stable id per row. Default: row.id, else the index.' },
            { name: 'label / caption / rowLabel', type: 'string / ReactNode / string', description: 'Table name, visible caption, and the noun used in counts ("payment").' },
            { name: 'striped, compact, bordered, stickyHeader, maxHeight', type: 'Table props', description: 'Passed to Table.' },
            { name: 'searchable', type: 'boolean', default: 'true', description: 'Global search field.' },
            { name: 'search / defaultSearch / onSearchChange', type: 'string', description: 'Controlled or uncontrolled query. Applied after searchDebounce (200ms).' },
            { name: 'sort / defaultSort / onSortChange', type: 'DataTableSort | null', description: '{ id, direction: "asc" | "desc" } or null.' },
            { name: 'columnFilters / defaultColumnFilters / onColumnFiltersChange', type: 'Record<string, string>', description: 'Per-column filter values.' },
            { name: 'selectable', type: 'boolean', default: 'false', description: 'Checkbox column.' },
            { name: 'selectedRowIds / defaultSelectedRowIds / onSelectedRowIdsChange', type: 'string[]', description: 'Selection, persists across pages.' },
            { name: 'bulkActions', type: '({ selectedRows, selectedIds, clearSelection }) => ReactNode', description: 'Content of the floating bar.' },
            { name: 'paginated', type: 'boolean', default: 'true', description: 'Paginate rows.' },
            { name: 'page / defaultPage / onPageChange', type: 'number', description: '1-based page.' },
            { name: 'pageSize / defaultPageSize / onPageSizeChange', type: 'number', default: '10', description: 'Rows per page.' },
            { name: 'pageSizeOptions', type: 'number[]', default: '[10, 25, 50]', description: 'Choices in the rows-per-page select.' },
            { name: 'columnsMenu', type: 'boolean', default: 'true', description: 'Columns visibility menu.' },
            { name: 'columnVisibility / defaultColumnVisibility / onColumnVisibilityChange', type: 'Record<string, boolean>', description: 'Visibility by column id.' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Skeleton rows, aria-busy.' },
            { name: 'emptyState', type: 'ReactNode', description: 'Replaces the default "No results" content.' },
            { name: 'toolbar', type: 'ReactNode', description: 'Extra controls before the Columns menu.' },
          ]}
        />
        <PropsTable
          title="DataTableColumn"
          rows={[
            { name: 'id', type: 'string', description: 'Unique, stable.' },
            { name: 'header', type: 'ReactNode', description: 'Header content.' },
            { name: 'label', type: 'string', description: 'Plain name for the columns menu (defaults to a string header).' },
            { name: 'accessor', type: 'keyof T | (row) => unknown', description: 'Value for display, sort, search and filter.' },
            { name: 'cell', type: '({ row, value, index, rowId }) => ReactNode', description: 'Custom cell.' },
            { name: 'sortable / compare', type: 'boolean / (a, b) => number', description: 'Sort button and optional comparator.' },
            { name: 'searchable / searchText', type: 'boolean / (row) => string', description: 'Global search participation and text.' },
            { name: 'filter / filterFn', type: '(ctx) => ReactNode / (row, value) => boolean', description: 'Filter-row control and predicate.' },
            { name: 'align, width, hidden, hideable', type: 'misc', description: 'Layout and visibility.' },
          ]}
        />
        <P>
          The pure helpers are exported too: <Code>dataTableFilterRows</Code>, <Code>dataTableSortRows</Code>, <Code>dataTablePaginate</Code>, <Code>dataTableCompareValues</Code> and <Code>dataTableNextDirection</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves through search, columns menu, sort buttons, checkboxes, row actions and the pager.'],
            ['Enter / Space', 'Activates a sort button, toggles a checkbox, presses prev / next.'],
            ['Esc', 'In the search field, clears it. In the columns menu, closes it.'],
            ['Arrow keys', 'Move between items in the columns menu.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Native table; sortable headers expose aria-sort and contain a real button.',
            'Every checkbox has a name (“Select all rows on this page”, or selectRowLabel).',
            'A polite live region announces the result count and sort after changes; loading sets aria-busy.',
            'Selection is never colour alone: the checkbox is checked and the footer counts it.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The bulk bar rises in (380ms soft rise) and exits faster (160ms). The sort arrow and empty state pop in.',
            'Reduced motion keeps every state change and drops the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
