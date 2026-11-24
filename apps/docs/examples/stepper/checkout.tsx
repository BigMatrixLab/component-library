'use client';

import { useState } from 'react';
import {
  Button,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from 'ui-kit';

const steps = [
  { title: 'Cart', description: '3 items, $184.00' },
  { title: 'Shipping', description: 'Address and delivery' },
  { title: 'Payment', description: 'Card details' },
  { title: 'Review', description: 'Confirm your order' },
];

export default function StepperCheckout() {
  const [step, setStep] = useState(2);
  const done = step > steps.length;
  return (
    <div className="grid gap-6">
      <Stepper value={step} onValueChange={setStep} aria-label="Checkout progress">
        {steps.map((s, i) => (
          <StepperItem key={s.title} step={i + 1} disabled={i + 1 > step}>
            <StepperTrigger>
              <StepperIndicator />
              <StepperContent>
                <StepperTitle>{s.title}</StepperTitle>
                <StepperDescription>{s.description}</StepperDescription>
              </StepperContent>
            </StepperTrigger>
            {i < steps.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>

      <div className="rounded-lg border border-border p-4 text-sm">
        {done ? (
          <p className="font-medium">Order #48213 placed. A receipt is on its way to amina@acme.dev.</p>
        ) : (
          <p>
            <span className="font-medium">{steps[step - 1]!.title}</span>
            <span className="text-muted-foreground">: {steps[step - 1]!.description}</span>
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
          Back
        </Button>
        <Button disabled={done} onClick={() => setStep((s) => Math.min(steps.length + 1, s + 1))}>
          {step === steps.length ? 'Place order' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
