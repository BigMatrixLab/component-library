'use client';

import { useState } from 'react';
import { BillingPrice, BillingToggle, type BillingCycle } from 'ui-kit';

export default function BillingToggleLocale() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <div lang="de" className="flex flex-col items-center gap-4">
      <BillingToggle
        size="sm"
        value={cycle}
        onValueChange={setCycle}
        monthlyLabel="Monatlich"
        yearlyLabel="Jährlich"
        savings="−2 Monate"
        aria-label="Abrechnungszeitraum"
      />
      <BillingPrice
        amount={cycle === 'yearly' ? 99.9 : 9.99}
        currency="EUR"
        locale="de-DE"
        period={cycle === 'yearly' ? '/ Jahr' : '/ Monat'}
        size="sm"
      />
    </div>
  );
}
