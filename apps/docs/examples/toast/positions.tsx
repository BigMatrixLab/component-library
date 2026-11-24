'use client';

import { useState } from 'react';
import { Button, Toaster, toast, type ToasterPosition } from 'ui-kit';

const positions: ToasterPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export default function ToastPositions() {
  const [position, setPosition] = useState<ToasterPosition>('bottom-right');

  return (
    <div className="grid justify-items-center gap-4">
      <div role="radiogroup" aria-label="Position" className="grid grid-cols-3 gap-2">
        {positions.map((p) => (
          <Button
            key={p}
            variant={p === position ? 'soft' : 'outline'}
            size="sm"
            role="radio"
            aria-checked={p === position}
            onClick={() => {
              setPosition(p);
              toast(`Docked ${p.replace('-', ' ')}`, { toasterId: 'positions', description: 'Swipe it toward the edge to dismiss.' });
            }}
          >
            {p}
          </Button>
        ))}
      </div>
      <Toaster id="positions" position={position} />
    </div>
  );
}
