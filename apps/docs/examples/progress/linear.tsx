import { Progress } from 'ui-kit';

const ROWS = [
  { id: 'storage', label: 'Storage', value: 62, text: '6.2 of 10 GB', tone: 'default' },
  { id: 'seats', label: 'Seats', value: 11, max: 12, text: '11 of 12 used', tone: 'warning' },
  { id: 'upload', label: 'Upload complete', value: 100, text: '100%', tone: 'success' },
] as const;

export default function ProgressLinear() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {ROWS.map((r) => (
        <div key={r.id} className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span id={`progress-${r.id}`} className="font-medium">
              {r.label}
            </span>
            <span className="text-muted-foreground tabular-nums">{r.text}</span>
          </div>
          <Progress aria-labelledby={`progress-${r.id}`} value={r.value} max={'max' in r ? r.max : 100} tone={r.tone} />
        </div>
      ))}
      <div className="space-y-3 pt-2">
        <Progress aria-label="Small" size="sm" value={40} />
        <Progress aria-label="Medium" value={40} />
        <Progress aria-label="Large" size="lg" value={40} />
      </div>
    </div>
  );
}
