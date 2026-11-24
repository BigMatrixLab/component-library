'use client';

import { useCountUp } from 'ui-kit';

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function CountUpStat({ end, label, format }: { end: number; label: string; format: (n: number) => string }) {
  const { ref, value } = useCountUp<HTMLDivElement>({ end });
  return (
    <div ref={ref} className="grid gap-1">
      <div className="text-3xl font-medium tracking-tight tabular-nums" aria-label={`${label}: ${format(end)}`} role="img">
        {format(value)}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/** Counts up from zero the first time each figure scrolls into view. */
export default function CountUpStats() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-3">
      <CountUpStat end={12480} label="Teams onboarded" format={(n) => integer.format(n)} />
      <CountUpStat end={99.98} label="Uptime, last 12 months" format={(n) => `${percent.format(n)}%`} />
      <CountUpStat end={4200000} label="Requests per day" format={(n) => integer.format(n)} />
    </div>
  );
}
