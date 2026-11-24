'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from 'ui-kit';

export default function RadioGroupHorizontal() {
  const [period, setPeriod] = useState('yearly');

  return (
    <div className="grid gap-3">
      <RadioGroup value={period} onValueChange={setPeriod} orientation="horizontal" aria-label="Billing period">
        <RadioGroupItem value="monthly" label="Monthly" />
        <RadioGroupItem value="yearly" label="Yearly" />
        <RadioGroupItem value="quarterly" label="Quarterly" disabled />
      </RadioGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {period === 'yearly' ? 'You save 20% with yearly billing.' : 'Billed every month. Cancel any time.'}
      </p>
    </div>
  );
}
