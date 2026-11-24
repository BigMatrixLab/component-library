'use client';

import { useState } from 'react';
import { Button, UsageMeter } from 'ui-kit';

export default function UsageMeterThresholds() {
  const [requests, setRequests] = useState(7000);

  return (
    <div className="grid w-full max-w-sm gap-6">
      <UsageMeter
        label="API requests"
        value={requests}
        max={10000}
        description="Resets on 1 December."
        formatValue={(n) => n.toLocaleString('en-US')}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setRequests((n) => Math.min(n + 1000, 10000))}>
          Use 1,000 requests
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setRequests(7000)}>
          Reset
        </Button>
      </div>
      <UsageMeter label="Team seats" value={10} max={10} size="sm" summary="10 of 10 seats" />
    </div>
  );
}
