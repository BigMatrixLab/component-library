'use client';

import { DonutChart } from 'ui-kit';

const sources = [
  { source: 'Organic search', visitors: 4820 },
  { source: 'Direct', visitors: 3160 },
  { source: 'Referral', visitors: 1940 },
  { source: 'Social', visitors: 1280 },
  { source: 'Email', visitors: 760 },
];

export default function DonutSources() {
  return (
    <div className="w-full">
      <DonutChart data={sources} index="source" valueKey="visitors" centerLabel="Visitors" valueFormat="number" height={260} />
    </div>
  );
}
