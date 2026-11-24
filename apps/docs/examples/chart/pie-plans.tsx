'use client';

import { DonutChart } from 'ui-kit';

const plans = [
  { plan: 'Starter', accounts: 612 },
  { plan: 'Team', accounts: 348 },
  { plan: 'Enterprise', accounts: 74 },
];

export default function PiePlans() {
  return (
    <div className="w-full">
      <DonutChart
        data={plans}
        index="plan"
        valueKey="accounts"
        innerRadius={0}
        padAngle={1.5}
        cornerRadius={3}
        colors={['series-1', 'series-2', 'series-4']}
        height={240}
      />
    </div>
  );
}
