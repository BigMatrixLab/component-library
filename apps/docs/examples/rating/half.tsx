'use client';

import { useState } from 'react';
import { Rating } from 'ui-kit';

export default function RatingHalf() {
  const [score, setScore] = useState(3.5);

  return (
    <div className="flex flex-col items-center gap-2">
      <Rating allowHalf value={score} onValueChange={setScore} aria-label="Film rating" size="lg" />
      <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
        {score.toFixed(1)} / 5
      </p>
    </div>
  );
}
