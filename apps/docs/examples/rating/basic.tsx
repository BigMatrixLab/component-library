'use client';

import { useState } from 'react';
import { Rating } from 'ui-kit';

const words = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function RatingBasic() {
  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col items-center gap-2">
      <Rating value={score} onValueChange={setScore} aria-label="Rate your stay" allowClear />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {score ? `${score} of 5 · ${words[score]}` : 'How was your stay at Harbour House?'}
      </p>
    </div>
  );
}
