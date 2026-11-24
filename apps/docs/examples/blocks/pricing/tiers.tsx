'use client';

import { useState } from 'react';
import { AnimatedNumber, Badge, Button, Icon, SegmentedControl, SegmentedControlItem } from 'ui-kit';

type Period = 'monthly' | 'yearly';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers and very small teams getting their books in order.',
    price: { monthly: 0, yearly: 0 },
    cta: 'Start for free',
    features: ['Up to 3 seats', '1 bank connection', 'Invoices and expenses', 'Monthly reports', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams that close every month and need approvals.',
    price: { monthly: 24, yearly: 19 },
    cta: 'Start 14-day trial',
    popular: true,
    features: ['Unlimited seats', 'Unlimited bank connections', 'Approval workflows', 'Live cash-flow forecast', 'Priority chat support'],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For finance teams with audits, entities and an IT department.',
    price: { monthly: 49, yearly: 39 },
    cta: 'Talk to sales',
    features: ['Everything in Pro', 'Multiple entities and currencies', 'SAML single sign-on', 'Audit log and data retention', 'Named account manager'],
  },
] as const;

/** Marketing block: one subtle wash of the primary colour behind the heading (design rule D2). */
const WASH = 'radial-gradient(60% 40% at 50% 0%, color-mix(in oklch, var(--ui-primary) 9%, transparent), transparent)';

const usd = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } as const;

function billingNote(price: { monthly: number; yearly: number }, period: Period) {
  if (price.monthly === 0) return 'Free forever, no card needed';
  if (period === 'monthly') return 'per seat / month, billed monthly';
  return `per seat / month, billed yearly ($${price.yearly * 12})`;
}

export default function PricingTiers() {
  const [period, setPeriod] = useState<Period>('monthly');

  return (
    <section
      aria-labelledby="pricing-title"
      className="@container w-full overflow-hidden rounded-xl border border-border bg-background px-5 py-14 @2xl:px-10"
      style={{ backgroundImage: WASH }}
    >
      <div className="mx-auto grid max-w-2xl justify-items-center gap-4 text-center">
        <Badge variant="outline">Pricing</Badge>
        <h2 id="pricing-title" className="font-display text-3xl font-semibold tracking-tight @2xl:text-4xl">
          Plans that grow with your team
        </h2>
        <p className="max-w-xl text-md text-muted-foreground">
          Start free, upgrade when you need approvals and forecasting. Every paid plan includes a 14-day trial and you can cancel at any time.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <SegmentedControl value={period} onValueChange={(v) => setPeriod(v as Period)} aria-label="Billing period">
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
          </SegmentedControl>
          <Badge variant="success" size="sm">
            Save 20% yearly
          </Badge>
        </div>
      </div>

      <ul className="mx-auto mt-12 grid max-w-5xl items-start gap-4 @3xl:grid-cols-3" aria-label="Plans">
        {PLANS.map((plan) => {
          const popular = 'popular' in plan && plan.popular;
          return (
            <li
              key={plan.id}
              data-plan={plan.id}
              className={
                popular
                  ? 'relative grid gap-6 rounded-xl border border-primary bg-card p-6 ring-1 ring-primary'
                  : 'relative grid gap-6 rounded-xl border border-border bg-card p-6'
              }
            >
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 id={`plan-${plan.id}`} className="text-lg font-semibold">
                    {plan.name}
                  </h3>
                  {popular && (
                    <Badge solid size="sm">
                      Most popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="grid gap-1">
                <div className="flex items-baseline gap-1.5">
                  <AnimatedNumber value={plan.price[period]} format={usd} className="font-display text-4xl font-semibold tracking-tight" />
                  {plan.price.monthly > 0 && <span className="text-sm text-muted-foreground">/ seat</span>}
                </div>
                <p className="text-sm text-muted-foreground" data-billing-note>
                  {billingNote(plan.price, period)}
                </p>
              </div>

              <Button variant={popular ? 'primary' : 'outline'} className="w-full">
                {plan.cta}
              </Button>

              <ul className="grid gap-2.5 border-t border-border pt-5 text-sm" aria-label={`${plan.name} features`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary-text" />
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Prices in USD, excluding VAT. Non-profits and schools get 50% off,{' '}
        <a href="#contact" className="font-medium text-primary-text hover:underline">
          ask us
        </a>
        .
      </p>
    </section>
  );
}
