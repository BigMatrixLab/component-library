'use client';

import { BarChart } from 'ui-kit';

const finance = [
  { month: 'Jan', revenue: 18400, expenses: 12100 },
  { month: 'Feb', revenue: 20250, expenses: 12900 },
  { month: 'Mar', revenue: 19600, expenses: 14300 },
  { month: 'Apr', revenue: 23100, expenses: 13800 },
  { month: 'May', revenue: 25800, expenses: 15200 },
  { month: 'Jun', revenue: 24900, expenses: 16700 },
];

export default function BarRevenue() {
  return (
    <div className="w-full">
      <BarChart
        data={finance}
        index="month"
        series={[
          { key: 'revenue', label: 'Revenue', color: 'series-1' },
          { key: 'expenses', label: 'Expenses', color: 'series-3' },
        ]}
        valueFormat="currency"
        height={288}
      />
    </div>
  );
}
