'use client';

import { useId, useState } from 'react';
import { Slider } from 'ui-kit';

export default function SliderPriceRange() {
  const labelId = useId();
  const [range, setRange] = useState([120, 640]);

  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-baseline justify-between text-base">
        <span id={labelId} className="font-medium">
          Price range
        </span>
        <span className="tabular-nums text-muted-foreground">
          ${range[0]} – ${range[1]}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        thumbLabels={['Minimum price', 'Maximum price']}
        value={range}
        onValueChange={setRange}
        min={0}
        max={1000}
        step={10}
        minStepsBetweenThumbs={5}
        formatValue={(v) => `$${v}`}
      />
    </div>
  );
}
