'use client';

import { AreaChart } from 'ui-kit';

// 90 days of visitors, Apr 1 to Jun 29. Weekends dip, mobile keeps climbing.
const visitors = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 3, 1 + i));
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  return {
    date: date.toISOString().slice(0, 10),
    desktop: Math.round(320 + 90 * Math.sin(i / 7) + i * 1.2 - (weekend ? 80 : 0)),
    mobile: Math.round(210 + 60 * Math.sin(i / 5 + 1) + i * 2.1 + (weekend ? 30 : 0)),
  };
});

const day = (v: string | number) =>
  new Date(`${v}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export default function AreaVisitors() {
  return (
    <div className="w-full">
      <AreaChart
        data={visitors}
        index="date"
        series={[
          { key: 'desktop', label: 'Desktop', color: 'series-1' },
          { key: 'mobile', label: 'Mobile', color: 'series-2' },
        ]}
        indexFormat={day}
        height={288}
      />
    </div>
  );
}
