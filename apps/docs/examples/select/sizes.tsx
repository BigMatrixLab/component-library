'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from 'ui-kit';

const plans = ['Monthly', 'Quarterly', 'Yearly'];

export default function SelectSizes() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} defaultValue="Quarterly">
          <SelectTrigger size={size} aria-label={`Billing period, ${size}`} />
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
