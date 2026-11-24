'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from 'ui-kit';

const plans = [
  { id: 'starter', name: 'Starter', price: '$0', blurb: '1 project, community support.' },
  { id: 'pro', name: 'Pro', price: '$19', blurb: 'Unlimited projects, email support.' },
  { id: 'team', name: 'Team', price: '$49', blurb: 'Roles, audit log and SSO.' },
];

export default function RadioGroupPlanCards() {
  const [plan, setPlan] = useState('pro');

  return (
    <div className="grid w-full max-w-md gap-3">
      <RadioGroup variant="card" value={plan} onValueChange={setPlan} name="plan" aria-label="Plan">
        {plans.map((p) => (
          <RadioGroupItem
            key={p.id}
            value={p.id}
            label={
              <span className="flex items-baseline justify-between gap-4">
                {p.name}
                <span className="font-normal tabular-nums text-muted-foreground">{p.price}/mo</span>
              </span>
            }
            description={p.blurb}
          />
        ))}
      </RadioGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Selected: {plans.find((p) => p.id === plan)?.name}
      </p>
    </div>
  );
}
