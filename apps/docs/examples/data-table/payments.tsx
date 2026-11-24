'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  type DataTableColumn,
} from 'ui-kit';

type Status = 'paid' | 'pending' | 'failed' | 'refunded';

interface Payment {
  id: string;
  customer: string;
  email: string;
  status: Status;
  method: string;
  amount: number;
  date: string;
}

const people = ['Amara Okafor', 'Liam Brennan', 'Sofia Marchetti', 'Noah Fischer', 'Yuki Tanaka', 'Priya Raman', 'Mateo Alvarez', 'Elena Petrova', 'Jonas Lindqvist', 'Hana Kim'];
const statuses: Status[] = ['paid', 'paid', 'pending', 'paid', 'failed', 'paid', 'refunded', 'pending'];
const methods = ['Visa', 'Mastercard', 'Bank transfer', 'PayPal'];

const payments: Payment[] = Array.from({ length: 40 }, (_, i) => {
  const customer = people[i % people.length];
  const day = new Date(Date.UTC(2025, 10, 28 - i));
  return {
    id: `PAY-${1042 + i}`,
    customer,
    email: `${customer.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    status: statuses[(i * 3) % statuses.length],
    method: methods[(i * 5) % methods.length],
    amount: ((i * 7919) % 94000) / 100 + 12,
    date: day.toISOString().slice(0, 10),
  };
});

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const tone = { paid: 'success', pending: 'warning', failed: 'destructive', refunded: 'secondary' } as const;

const columns: DataTableColumn<Payment>[] = [
  {
    id: 'customer',
    header: 'Customer',
    accessor: 'customer',
    sortable: true,
    searchText: (row) => `${row.customer} ${row.email}`,
    cell: ({ row }) => (
      <div className="grid leading-tight">
        <span className="font-medium">{row.customer}</span>
        <span className="text-xs text-muted-foreground">{row.email}</span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: ({ row }) => (
      <Badge variant={tone[row.status]} dot>
        {row.status[0].toUpperCase() + row.status.slice(1)}
      </Badge>
    ),
  },
  { id: 'method', header: 'Method', accessor: 'method', sortable: true },
  {
    id: 'date',
    header: 'Date',
    accessor: 'date',
    sortable: true,
    cell: ({ row }) => dateFormat.format(new Date(`${row.date}T00:00:00Z`)),
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    sortable: true,
    align: 'right',
    cell: ({ row }) => money.format(row.amount),
  },
  {
    id: 'actions',
    header: <span className="sr-only">Actions</span>,
    label: 'Actions',
    hideable: false,
    align: 'right',
    width: 56,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" icon aria-label={`Actions for ${row.id}`}>
            <Icon name="more-horizontal" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottom-end">
          <DropdownMenuItem onSelect={() => void navigator.clipboard?.writeText(row.id)}>Copy payment ID</DropdownMenuItem>
          <DropdownMenuItem>View receipt</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={row.status !== 'paid'}>Refund payment</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function PaymentsDataTable() {
  const [exported, setExported] = useState<number | null>(null);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={payments}
        label="Payments"
        rowLabel="payment"
        searchPlaceholder="Search payments"
        selectable
        selectRowLabel={(row) => `Select ${row.id}`}
        defaultSort={{ id: 'date', direction: 'desc' }}
        bulkActions={({ selectedRows, clearSelection }) => (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setExported(selectedRows.length);
                clearSelection();
              }}
            >
              <Icon name="download" />
              Export
            </Button>
            <Button size="sm" variant="destructive">
              Refund
            </Button>
          </>
        )}
      />
      <p className="mt-3 h-5 text-sm text-muted-foreground" role="status">
        {exported !== null ? `Exported ${exported} ${exported === 1 ? 'payment' : 'payments'}.` : ''}
      </p>
    </div>
  );
}
