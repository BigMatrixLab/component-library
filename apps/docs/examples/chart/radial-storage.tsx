'use client';

import { RadialChart } from 'ui-kit';

export default function RadialStorage() {
  return (
    <div className="mx-auto w-full max-w-xs">
      <RadialChart
        variant="semicircle"
        data={[{ name: 'Storage used', value: 72.4 }]}
        index="name"
        valueKey="value"
        max={100}
        valueFormat={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
        centerLabel="of 100 GB used"
        height={170}
      />
    </div>
  );
}
