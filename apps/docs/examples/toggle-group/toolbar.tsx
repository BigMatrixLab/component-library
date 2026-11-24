'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from 'ui-kit';

export default function ToggleToolbar() {
  const [format, setFormat] = useState<string[]>(['bold']);
  const [align, setAlign] = useState('left');

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ToggleGroup type="multiple" variant="outline" value={format} onValueChange={setFormat} aria-label="Text formatting">
          <ToggleGroupItem value="bold" icon aria-label="Bold" className="font-semibold">
            B
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" icon aria-label="Italic" className="italic">
            I
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" icon aria-label="Underline" className="underline">
            U
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" value={align} onValueChange={(v) => setAlign(v || align)} aria-label="Text alignment">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Centre</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {format.length ? format.join(' + ') : 'No formatting'} · aligned {align}
      </p>
    </div>
  );
}
