'use client';

import { useState } from 'react';
import { Button, LineChart } from 'ui-kit';

type Curve = 'monotone' | 'linear' | 'step';

const latency = [
  { hour: '00:00', p50: 112, p95: 240 },
  { hour: '03:00', p50: 104, p95: 218 },
  { hour: '06:00', p50: 118, p95: 262 },
  { hour: '09:00', p50: 146, p95: 388 },
  { hour: '12:00', p50: 171, p95: 452 },
  { hour: '15:00', p50: 158, p95: 410 },
  { hour: '18:00', p50: 139, p95: 331 },
  { hour: '21:00', p50: 121, p95: 275 },
];

export default function LineCurves() {
  const [curve, setCurve] = useState<Curve>('monotone');
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-1" role="group" aria-label="Curve">
        {(['monotone', 'linear', 'step'] as const).map((c) => (
          <Button key={c} size="sm" variant={curve === c ? 'secondary' : 'ghost'} aria-pressed={curve === c} onClick={() => setCurve(c)}>
            {c[0].toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>
      <LineChart
        data={latency}
        index="hour"
        curve={curve}
        series={[
          { key: 'p50', label: 'p50 latency' },
          { key: 'p95', label: 'p95 latency', color: 'series-4' },
        ]}
        valueFormat={{ style: 'unit', unit: 'millisecond', unitDisplay: 'narrow' }}
        height={260}
      />
    </div>
  );
}
