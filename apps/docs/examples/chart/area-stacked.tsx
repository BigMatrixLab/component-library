'use client';

import { AreaChart } from 'ui-kit';

const mrr = [
  { month: 'Jan', starter: 4200, team: 7800, enterprise: 12400 },
  { month: 'Feb', starter: 4350, team: 8100, enterprise: 13900 },
  { month: 'Mar', starter: 4600, team: 8900, enterprise: 14200 },
  { month: 'Apr', starter: 4550, team: 9600, enterprise: 16800 },
  { month: 'May', starter: 4900, team: 10300, enterprise: 18100 },
  { month: 'Jun', starter: 5100, team: 11200, enterprise: 21500 },
];

export default function AreaStacked() {
  return (
    <div className="w-full">
      <AreaChart
        data={mrr}
        index="month"
        stacked
        series={[
          { key: 'enterprise', label: 'Enterprise' },
          { key: 'team', label: 'Team' },
          { key: 'starter', label: 'Starter' },
        ]}
        valueFormat="currency"
        legend="top"
        height={288}
      />
    </div>
  );
}
