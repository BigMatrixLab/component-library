'use client';

import { InlineEdit } from 'ui-kit';

const rows = [
  { label: 'Owner', value: 'Dana Whitfield' },
  { label: 'Region', value: 'eu-west-2' },
  { label: 'Billing email', value: 'billing@northwind.example' },
];

export default function InlineEditDetails() {
  return (
    <dl className="w-full max-w-sm divide-y divide-border rounded-xl border border-border px-4 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 py-3">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd>
            <InlineEdit defaultValue={row.value} label={row.label} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
