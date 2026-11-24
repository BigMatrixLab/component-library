import { Badge, ScrollArea } from 'ui-kit';

const releases = [
  { version: '2.14.0', date: '24 November 2026', tag: 'Feature', notes: ['Scheduled reports can be sent to Slack channels.', 'Invoices show a payment timeline.', 'New keyboard shortcut ⌘K for the command menu.'] },
  { version: '2.13.2', date: '12 November 2026', tag: 'Fix', notes: ['Fixed rounding on multi-currency invoices.', 'CSV exports keep leading zeros in account numbers.'] },
  { version: '2.13.0', date: '29 October 2026', tag: 'Feature', notes: ['Team roles: viewer, editor, billing admin.', 'Audit log retention extended to 24 months.', 'Dark mode follows the system setting by default.'] },
  { version: '2.12.1', date: '16 October 2026', tag: 'Fix', notes: ['Webhook retries no longer duplicate events.', 'Date pickers respect the workspace week start.'] },
  { version: '2.12.0', date: '2 October 2026', tag: 'Feature', notes: ['Import customers from a CSV in under a minute.', 'Bulk actions on the invoice list.', 'Faster dashboard loads for workspaces over 10,000 rows.'] },
  { version: '2.11.0', date: '18 September 2026', tag: 'Feature', notes: ['Expense categories can be nested.', 'Receipts are scanned and matched automatically.'] },
];

export default function ScrollAreaChangelog() {
  return (
    <ScrollArea className="h-80 w-full max-w-lg rounded-lg border border-border" label="Changelog" viewportClassName="px-5 py-4">
      <h3 className="mb-4 text-md font-semibold tracking-tight">Changelog</h3>
      <ol className="space-y-6">
        {releases.map((r) => (
          <li key={r.version}>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium tabular-nums">v{r.version}</span>
              <Badge variant={r.tag === 'Fix' ? 'secondary' : 'success'} size="sm">
                {r.tag}
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {r.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
