import { Badge, Icon, ScrollArea } from 'ui-kit';

const files = [
  { name: 'Q3-report.pdf', size: '2.4 MB' },
  { name: 'brand-guidelines.pdf', size: '8.1 MB' },
  { name: 'invoice-0482.pdf', size: '96 KB' },
  { name: 'team-photo.jpg', size: '3.7 MB' },
  { name: 'roadmap-2027.xlsx', size: '412 KB' },
  { name: 'contract-signed.pdf', size: '1.2 MB' },
  { name: 'pitch-deck.pptx', size: '14.9 MB' },
  { name: 'receipts-oct.zip', size: '5.5 MB' },
];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" className="w-full max-w-lg" label="Recent files" viewportClassName="pb-3">
      <ul className="flex gap-3">
        {files.map((f) => (
          <li key={f.name} className="w-40 shrink-0 rounded-lg border border-border bg-card p-3">
            <Icon name="file" size={20} className="mb-3 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{f.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{f.size}</p>
          </li>
        ))}
        <li className="flex shrink-0 items-center pr-2">
          <Badge variant="secondary">8 files</Badge>
        </li>
      </ul>
    </ScrollArea>
  );
}
