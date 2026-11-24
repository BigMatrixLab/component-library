'use client';

import { Slider } from 'ui-kit';

const levels = ['Draft', 'Standard', 'High', 'Maximum'];

export default function SliderQuality() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-baseline justify-between text-base">
        <span className="font-medium">Export quality</span>
        <span className="text-sm text-muted-foreground">Arrow keys move one level</span>
      </div>
      <Slider aria-label="Export quality" defaultValue={[1]} min={0} max={levels.length - 1} step={1} formatValue={(v) => levels[v] ?? String(v)} tooltip="always" />
      <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
        {levels.map((level) => (
          <span key={level}>{level}</span>
        ))}
      </div>
    </div>
  );
}
