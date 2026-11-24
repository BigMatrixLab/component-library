'use client';

import { useState } from 'react';
import { SegmentedControl, SegmentedControlItem } from 'ui-kit';

const prices = { monthly: '$24 / month', yearly: '$240 / year (save $48)' };

export default function SegmentedBilling() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl value={plan} onValueChange={(v) => setPlan(v as 'monthly' | 'yearly')} aria-label="Billing period">
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Team plan: {prices[plan]}
      </p>
    </div>
  );
}
