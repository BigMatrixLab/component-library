'use client';

import { BarChart } from 'ui-kit';

// Money in is positive, money out is negative: bars stack up and down from zero.
const cashflow = [
  { month: 'Jan', subscriptions: 14200, services: 4200, payroll: -9800, tools: -2300 },
  { month: 'Feb', subscriptions: 15100, services: 5150, payroll: -9800, tools: -3100 },
  { month: 'Mar', subscriptions: 15900, services: 3700, payroll: -10400, tools: -3900 },
  { month: 'Apr', subscriptions: 17300, services: 5800, payroll: -10400, tools: -3400 },
  { month: 'May', subscriptions: 18800, services: 7000, payroll: -11200, tools: -4000 },
  { month: 'Jun', subscriptions: 19400, services: 5500, payroll: -11200, tools: -5500 },
];

export default function BarCashflow() {
  return (
    <div className="w-full">
      <BarChart
        data={cashflow}
        index="month"
        stacked
        series={[
          { key: 'subscriptions', label: 'Subscriptions', color: 'series-1' },
          { key: 'services', label: 'Services', color: 'series-5' },
          { key: 'payroll', label: 'Payroll', color: 'series-4' },
          { key: 'tools', label: 'Tools', color: 'series-3' },
        ]}
        valueFormat="currency"
        height={300}
      />
    </div>
  );
}
