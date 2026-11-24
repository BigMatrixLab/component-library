import type { CSSProperties } from 'react';
import { Button } from 'ui-kit';

/** The same block of UI rendered in a given font pair, for side-by-side comparison. */
export function FontSample({
  name,
  note,
  sans,
  display,
  displayWeight = 600,
}: {
  name: string;
  note: string;
  sans: string;
  display: string;
  /** Some display faces ship a single weight; never let the browser fake bold. */
  displayWeight?: number;
}) {
  const style = { '--ui-font-sans': sans, '--ui-font-display': display, fontFamily: sans } as CSSProperties;
  return (
    <section style={style} className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <h3 className="font-display text-4xl leading-tight tracking-tight" style={{ fontWeight: displayWeight, letterSpacing: displayWeight === 400 ? '-0.005em' : undefined }}>Ship calmer software.</h3>
      <p className="mt-3 max-w-prose text-md text-muted-foreground">
        Revenue grew 18.4% this quarter while churn dropped to 1.9%. Invite your team, connect a data source and your first dashboard is ready in minutes.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ['Revenue', '$48,210'],
          ['Active users', '12,834'],
          ['Conversion', '3.42%'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button>Create workspace</Button>
        <Button variant="outline">Import data</Button>
        <span className="ml-1 text-sm text-muted-foreground">Settings · Billing · 0123456789 · Il1 O0</span>
      </div>
    </section>
  );
}
