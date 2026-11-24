'use client';

import { useState } from 'react';
import { Button, OnboardingChecklist } from 'ui-kit';

const STEPS = [
  { id: 'email', title: 'Verify your email', cta: 'Verify' },
  { id: 'card', title: 'Add a payment method', cta: 'Add card' },
  { id: 'domain', title: 'Connect your domain', cta: 'Connect' },
  { id: 'publish', title: 'Publish your store', cta: 'Publish' },
];

export default function OnboardingChecklistAppDriven() {
  const [done, setDone] = useState<string[]>(['email']);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Checklist dismissed.</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDone(['email']);
            setDismissed(false);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <OnboardingChecklist
        title="Launch your store"
        description="Steps tick off as you finish them."
        completeTitle="Your store is live"
        completeDescription="Share the link and take your first order."
        progress="bar"
        checkable={false}
        value={done}
        onValueChange={setDone}
        onDismiss={() => setDismissed(true)}
        steps={STEPS.map((s) => ({
          id: s.id,
          title: s.title,
          action: (
            <Button size="xs" variant="outline" onClick={() => setDone((d) => (d.includes(s.id) ? d : [...d, s.id]))}>
              {s.cta}
            </Button>
          ),
        }))}
      />
    </div>
  );
}
