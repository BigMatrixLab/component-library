'use client';

import { useId, useState } from 'react';
import { Slider } from 'ui-kit';

export default function SliderVolume() {
  const labelId = useId();
  const [volume, setVolume] = useState([40]);

  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-baseline justify-between text-base">
        <span id={labelId} className="font-medium">
          Volume
        </span>
        <span className="tabular-nums text-muted-foreground">{volume[0]}%</span>
      </div>
      <Slider aria-labelledby={labelId} value={volume} onValueChange={setVolume} name="volume" formatValue={(v) => `${v}%`} />
    </div>
  );
}
