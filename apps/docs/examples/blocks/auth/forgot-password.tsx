'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, FieldError, Form, Icon, Input, Label } from 'ui-kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_AFTER = 30;

export default function AuthForgotPassword() {
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_AFTER);
  const [resent, setResent] = useState(false);
  // Move focus to the new heading when the step changes (not on first render)
  const heading = useRef<HTMLHeadingElement>(null);
  const prev = useRef(step);
  useEffect(() => {
    if (prev.current !== step) heading.current?.focus();
    prev.current = step;
  }, [step]);

  useEffect(() => {
    if (step !== 'sent' || wait === 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, wait]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    const value = input.value.trim();
    const message = !value ? 'Enter the email you signed up with.' : !EMAIL.test(value) ? 'Enter an email like name@company.com.' : undefined;
    setError(message);
    if (message) {
      input.focus();
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setEmail(value);
      setWait(RESEND_AFTER);
      setResent(false);
      setStep('sent');
    }, 1000);
  };

  const resend = () => {
    setWait(RESEND_AFTER);
    setResent(true);
  };

  return (
    <div className="@container grid w-full place-items-center rounded-xl border border-border bg-muted px-4 py-10 @md:py-14">
      <Card className="w-full max-w-md @md:[--ui-card-padding:2rem]">
        {step === 'request' ? (
          <>
            <CardHeader>
              <span className="mb-2 grid size-11 place-items-center rounded-full border border-border bg-muted">
                <Icon name="lock" size={20} />
              </span>
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                Forgot your password?
              </CardTitle>
              <CardDescription>Enter the email you signed up with and we’ll send you a link to choose a new one.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form noValidate onSubmit={submit} aria-label="Reset password">
                <Field invalid={!!error}>
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ada@northwind.com"
                    defaultValue={email}
                    onChange={() => error && setError(undefined)}
                  />
                  <FieldError>{error}</FieldError>
                </Field>
                <Button type="submit" className="w-full" loading={busy}>
                  Send reset link
                </Button>
              </Form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <span className="mb-2 grid size-11 place-items-center rounded-full border border-border bg-muted">
                <Icon name="mail" size={20} />
              </span>
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                Check your inbox
              </CardTitle>
              <CardDescription>
                If an account exists for <span className="font-medium text-foreground">{email}</span>, you’ll get a reset link in the next minute. It
                expires in 30 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="w-full">
                <a href="mailto:">
                  <Icon name="external-link" />
                  Open email app
                </a>
              </Button>
              <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <p>Didn’t get it? Check your spam folder, or make sure you used the address you signed up with.</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {wait > 0 ? (
                    <span className="tabular-nums">Resend in 0:{String(wait).padStart(2, '0')}</span>
                  ) : (
                    <Button variant="link" size="sm" className="h-auto px-0" onClick={resend}>
                      Resend email
                    </Button>
                  )}
                  <Button variant="link" size="sm" className="h-auto px-0" onClick={() => setStep('request')}>
                    Try another email
                  </Button>
                </div>
              </div>
              <p role="status" className="text-sm text-success-text empty:hidden">
                {resent ? 'We sent another link. Only the newest link works.' : ''}
              </p>
            </CardContent>
          </>
        )}
        <div className="px-[var(--ui-card-padding)] text-center">
          <a href="#sign-in" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Icon name="arrow-left" size={16} />
            Back to sign in
          </a>
        </div>
      </Card>
    </div>
  );
}
