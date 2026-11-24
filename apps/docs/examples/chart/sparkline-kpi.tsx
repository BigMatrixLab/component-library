'use client';

import type { ReactNode } from 'react';
import { Sparkline } from 'ui-kit';

const signups = [38, 42, 35, 51, 47, 58, 54, 63, 59, 71, 68, 84];
const churn = [4.1, 3.8, 4.4, 4.0, 3.7, 3.9, 3.4, 3.5, 3.1, 3.2, 2.9, 2.7];

function Tile({ label, value, delta, children }: { label: string; value: string; delta: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{delta}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function SparklineKpi() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      <Tile label="New signups" value="84" delta="+121% in 12 days">
        <Sparkline data={signups} variant="area" trend height={40} aria-label="Signups per day, rising from 38 to 84" />
      </Tile>
      <Tile label="Weekly signups" value="612" delta="last 12 weeks">
        <Sparkline data={signups} variant="bar" height={40} color="series-2" aria-label="Weekly signups, 12 weeks" />
      </Tile>
      <Tile label="Churn rate" value="2.7%" delta="down from 4.1%">
        <Sparkline data={churn} variant="line" height={40} color="series-4" valueFormat="percent" aria-label="Churn rate falling from 4.1% to 2.7%" />
      </Tile>
    </div>
  );
}
