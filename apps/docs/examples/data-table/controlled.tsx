'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, DataTable, NativeSelect, type DataTableColumn, type DataTableSort } from 'ui-kit';

interface Member {
  id: number;
  name: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  team: string;
  seats: number;
}

const members: Member[] = [
  { id: 1, name: 'Amara Okafor', role: 'Owner', team: 'Platform', seats: 12 },
  { id: 2, name: 'Liam Brennan', role: 'Admin', team: 'Growth', seats: 8 },
  { id: 3, name: 'Sofia Marchetti', role: 'Editor', team: 'Design', seats: 5 },
  { id: 4, name: 'Noah Fischer', role: 'Viewer', team: 'Finance', seats: 2 },
  { id: 5, name: 'Yuki Tanaka', role: 'Editor', team: 'Platform', seats: 9 },
  { id: 6, name: 'Priya Raman', role: 'Admin', team: 'Support', seats: 14 },
  { id: 7, name: 'Mateo Alvarez', role: 'Viewer', team: 'Growth', seats: 3 },
  { id: 8, name: 'Elena Petrova', role: 'Editor', team: 'Design', seats: 6 },
];

const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    sortable: true,
    filter: ({ value, onChange, label }) => (
      <NativeSelect size="sm" aria-label={`Filter by ${label.toLowerCase()}`} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All roles</option>
        <option value="Owner">Owner</option>
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
      </NativeSelect>
    ),
    filterFn: (row, value) => row.role === value,
    cell: ({ row }) => <Badge variant={row.role === 'Owner' ? 'default' : 'secondary'}>{row.role}</Badge>,
  },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true },
  { id: 'seats', header: 'Seats', accessor: 'seats', sortable: true, align: 'right' },
];

/** Every piece of state is held by the parent: search, sort, filters, page and loading. */
export default function ControlledDataTable() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<DataTableSort | null>({ id: 'seats', direction: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Pretend to refetch
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Button size="sm" variant="outline" onClick={() => setLoading(true)} disabled={loading}>
          Reload
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearch('');
            setFilters({});
            setSort(null);
            setPage(1);
          }}
        >
          Reset all
        </Button>
        <span aria-live="polite">
          Sorted by {sort ? `${sort.id} (${sort.direction})` : 'none'}, page {page}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={members}
        label="Team members"
        rowLabel="member"
        compact
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        columnFilters={filters}
        onColumnFiltersChange={setFilters}
        page={page}
        onPageChange={setPage}
        defaultPageSize={5}
        pageSizeOptions={[5, 10]}
        columnsMenu={false}
      />
    </div>
  );
}
