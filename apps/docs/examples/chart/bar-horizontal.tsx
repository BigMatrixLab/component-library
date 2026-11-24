'use client';

import { BarChart } from 'ui-kit';

const pages = [
  { page: '/pricing', views: 18420 },
  { page: '/docs/getting-started', views: 15310 },
  { page: '/blog/launch-week', views: 11270 },
  { page: '/changelog', views: 7940 },
  { page: '/customers', views: 5180 },
];

export default function BarHorizontal() {
  return (
    <div className="w-full">
      <BarChart
        data={pages}
        index="page"
        orientation="horizontal"
        series={[{ key: 'views', label: 'Page views' }]}
        valueFormat="number"
        height={260}
      />
    </div>
  );
}
