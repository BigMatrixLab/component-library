'use client';

import { useState } from 'react';
import { Button } from 'ui-kit';

const presets = [
  { name: 'snappy', use: 'Presses, small indicators', easing: 'var(--ui-spring-snappy)', duration: 'var(--ui-spring-snappy-duration)' },
  { name: 'smooth', use: 'Panels, height, drawers — never overshoots', easing: 'var(--ui-spring-smooth)', duration: 'var(--ui-spring-smooth-duration)' },
  { name: 'morph', use: 'Gliding highlights, width that follows content', easing: 'var(--ui-spring-morph)', duration: 'var(--ui-spring-morph-duration)' },
  { name: 'ease-out', use: 'Entrances (tween, 380ms)', easing: 'var(--ui-ease-out)', duration: 'var(--ui-duration-slow)' },
];

/** Moves a dot across a track with each preset so the curves can be compared. */
export function SpringDemo() {
  const [on, setOn] = useState(false);
  return (
    <div className="mb-6 rounded-xl border border-border p-5">
      <div className="grid gap-4">
        {presets.map((p) => (
          <div key={p.name} className="grid grid-cols-[6rem_1fr] items-center gap-4">
            <div>
              <p className="font-mono text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.use}</p>
            </div>
            <div className="@container relative h-8 rounded-full bg-muted">
              <span
                className="absolute top-1 left-1 size-6 rounded-full bg-primary shadow-sm"
                style={{
                  transform: on ? 'translateX(calc(100cqw - 2rem))' : 'none',
                  transition: `transform ${p.duration} ${p.easing}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-5" variant="outline" size="sm" onClick={() => setOn((v) => !v)}>
        Play
      </Button>
    </div>
  );
}
