'use client';

import { useState } from 'react';
import { Button, TextShimmer } from 'ui-kit';

export default function TextShimmerThinking() {
  const [thinking, setThinking] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <div className="rounded-lg border border-border px-4 py-3 text-sm">
        <p className="mb-1 font-medium">Why did churn rise in October?</p>
        <p role="status">
          <TextShimmer active={thinking} className={thinking ? undefined : 'text-muted-foreground'}>
            {thinking ? 'Thinking through 3 quarters of billing data…' : 'Thought for 6 seconds'}
          </TextShimmer>
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={() => setThinking((t) => !t)}>
        {thinking ? 'Stop' : 'Ask again'}
      </Button>
    </div>
  );
}
