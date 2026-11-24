'use client';

import { LineChart } from 'ui-kit';

const finance = [
  { month: 'Jan', revenue: 18400, expenses: 12100 },
  { month: 'Feb', revenue: 20250, expenses: 12900 },
  { month: 'Mar', revenue: 19600, expenses: 14300 },
  { month: 'Apr', revenue: 23100, expenses: 13800 },
  { month: 'May', revenue: 25800, expenses: 15200 },
  { month: 'Jun', revenue: 24900, expenses: 16700 },
  { month: 'Jul', revenue: 28300, expenses: 16100 },
  { month: 'Aug', revenue: 30100, expenses: 17400 },
  { month: 'Sep', revenue: 29400, expenses: 18900 },
  { month: 'Oct', revenue: 32800, expenses: 18200 },
  { month: 'Nov', revenue: 35600, expenses: 19800 },
  { month: 'Dec', revenue: 38900, expenses: 21300 },
];

export default function LineRevenue() {
  return (
    <div className="w-full">
      <LineChart
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
