'use client';

import { useState } from 'react';
import { BillingPrice, BillingToggle, type BillingCycle } from 'ui-kit';

export default function BillingToggleBasic() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const yearly = cycle === 'yearly';

  return (
    <div className="flex flex-col items-center gap-5">
      <BillingToggle value={cycle} onValueChange={setCycle} savings="Save 20%" />
      <div className="flex flex-col items-center gap-1.5">
        <BillingPrice amount={yearly ? 24 : 30} period="/ month" size="lg" />
        <p className="text-sm text-muted-foreground">{yearly ? 'Billed $288 once a year' : 'Billed monthly, cancel anytime'}</p>
      </div>
    </div>
  );
}
