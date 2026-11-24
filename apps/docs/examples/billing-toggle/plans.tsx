'use client';

import { useState } from 'react';
import {
  BillingPrice,
  BillingToggle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type BillingCycle,
} from 'ui-kit';

const plans = [
  { name: 'Starter', description: 'For freelancers and side projects.', monthly: 15, yearly: 12 },
  { name: 'Team', description: 'For teams that ship every week.', monthly: 30, yearly: 24 },
  { name: 'Business', description: 'SSO, audit log and priority support.', monthly: 80, yearly: 64 },
];

export default function BillingTogglePlans() {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <BillingToggle value={cycle} onValueChange={setCycle} savings="Save 20%" aria-label="Plan billing period" />
      <div className="grid w-full gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Three prices change together: the toggle's own state is announced instead */}
              <BillingPrice amount={cycle === 'yearly' ? plan.yearly : plan.monthly} period="/ month" announce={false} />
            </CardContent>
            <CardFooter>
              <Button size="sm" variant={plan.name === 'Team' ? 'primary' : 'outline'} className="w-full">
                Choose {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
