'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldError,
  FieldHint,
  Form,
  Icon,
  Input,
  InputOTP,
  Label,
  PasswordInput,
  Separator,
} from 'ui-kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_AFTER = 30;

type Errors = { name?: string; email?: string; password?: string; terms?: string };

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Round badge above the card title for the verify and done steps. */
function StepIcon({ name, tone = 'muted' }: { name: 'mail' | 'check'; tone?: 'muted' | 'success' }) {
  return (
    <span
      className={
        tone === 'success'
          ? 'mb-2 grid size-11 place-items-center rounded-full bg-success text-success-foreground'
          : 'mb-2 grid size-11 place-items-center rounded-full border border-border bg-muted text-foreground'
      }
    >
      <Icon name={name} size={20} />
    </span>
  );
}

function validate(data: FormData): Errors {
  const name = String(data.get('name') ?? '').trim();
  const email = String(data.get('email') ?? '').trim();
  const password = String(data.get('password') ?? '');
  return {
    name: name ? undefined : 'Enter your full name.',
    email: !email ? 'Enter your work email.' : !EMAIL.test(email) ? 'Enter an email like name@company.com.' : undefined,
    password: password.length < 8 || !/\d/.test(password) ? 'Use at least 8 characters, including a number.' : undefined,
    terms: data.get('terms') ? undefined : 'Accept the terms to create an account.',
  };
}

export default function AuthSignUpCard() {
  const [step, setStep] = useState<'form' | 'verify' | 'done'>('form');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(RESEND_AFTER);
  const termsErrorId = useId();
  // Move focus to the new heading when the step changes (the OTP field focuses itself)
  const heading = useRef<HTMLHeadingElement>(null);
  const prev = useRef(step);
  useEffect(() => {
    if (prev.current !== step && step !== 'verify') heading.current?.focus();
    prev.current = step;
  }, [step]);

  // Resend countdown while the verify step is showing
  useEffect(() => {
    if (step !== 'verify' || wait === 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, wait]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next = validate(data);
    setErrors(next);
    const firstInvalid = (['name', 'email', 'password', 'terms'] as const).find((k) => next[k]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement | null)?.focus();
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setEmail(String(data.get('email')).trim());
      setCode('');
      setWait(RESEND_AFTER);
      setStep('verify');
    }, 1000);
  };

  const verify = (value = code) => {
    if (value.length < 6 || busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep('done');
    }, 1000);
  };

  const clear = (key: keyof Errors) => () => errors[key] && setErrors((prev) => ({ ...prev, [key]: undefined }));

  return (
    <div className="@container grid w-full place-items-center rounded-xl border border-border bg-muted px-4 py-10 @md:py-14">
      <Card className="w-full max-w-md @md:[--ui-card-padding:2rem]">
        {step === 'form' && (
          <>
            <CardHeader>
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                Create your account
              </CardTitle>
              <CardDescription>Start a 14-day trial of Lumen Pro. No card needed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Button variant="outline" className="w-full">
                  <GoogleMark />
                  Sign up with Google
                </Button>
                <Button variant="outline" className="w-full">
                  <GitHubMark />
                  Sign up with GitHub
                </Button>
              </div>
              <Separator>or</Separator>
              <Form noValidate onSubmit={submit} aria-label="Create account">
                <Field invalid={!!errors.name}>
                  <Label>Full name</Label>
                  <Input name="name" autoComplete="name" placeholder="Ada Lovelace" onChange={clear('name')} />
                  <FieldError>{errors.name}</FieldError>
                </Field>
                <Field invalid={!!errors.email}>
                  <Label>Work email</Label>
                  <Input name="email" type="email" autoComplete="email" placeholder="ada@northwind.com" onChange={clear('email')} />
                  <FieldError>{errors.email}</FieldError>
                </Field>
                <Field invalid={!!errors.password}>
                  <Label>Password</Label>
                  <PasswordInput name="password" autoComplete="new-password" onChange={clear('password')} />
                  {errors.password ? <FieldError>{errors.password}</FieldError> : <FieldHint>At least 8 characters, including a number.</FieldHint>}
                </Field>
                <div className="grid gap-1.5">
                  <Checkbox
                    name="terms"
                    invalid={!!errors.terms}
                    aria-describedby={errors.terms ? termsErrorId : undefined}
                    onCheckedChange={() => clear('terms')()}
                    label={
                      <>
                        I agree to the{' '}
                        <a href="#terms" className="font-medium text-primary-text hover:underline">
                          Terms
                        </a>{' '}
                        and{' '}
                        <a href="#privacy" className="font-medium text-primary-text hover:underline">
                          Privacy Policy
                        </a>
                      </>
                    }
                  />
                  <Field invalid={!!errors.terms}>
                    <FieldError id={termsErrorId}>{errors.terms}</FieldError>
                  </Field>
                </div>
                <Button type="submit" className="w-full" loading={busy}>
                  Create account
                </Button>
              </Form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
              <span>
                Already have an account?{' '}
                <a href="#sign-in" className="font-medium text-primary-text hover:underline">
                  Sign in
                </a>
              </span>
            </CardFooter>
          </>
        )}

        {step === 'verify' && (
          <>
            <CardHeader>
              <StepIcon name="mail" />
              <CardTitle as="h1" className="text-xl">
                Check your email
              </CardTitle>
              <CardDescription>
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. It expires in 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <form
                className="grid gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  verify();
                }}
              >
                <InputOTP
                  aria-label="Verification code"
                  groups={[3, 3]}
                  value={code}
                  onValueChange={setCode}
                  onComplete={verify}
                  autoFocus
                  disabled={busy}
                />
                <Button type="submit" className="w-full" loading={busy} disabled={code.length < 6}>
                  Verify email
                </Button>
              </form>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Button variant="link" size="sm" className="px-0" onClick={() => setStep('form')}>
                  <Icon name="arrow-left" />
                  Use a different email
                </Button>
                {wait > 0 ? (
                  <span className="text-muted-foreground tabular-nums" aria-live="off">
                    Resend code in 0:{String(wait).padStart(2, '0')}
                  </span>
                ) : (
                  <Button variant="link" size="sm" className="px-0" onClick={() => setWait(RESEND_AFTER)}>
                    Resend code
                  </Button>
                )}
              </div>
            </CardContent>
          </>
        )}

        {step === 'done' && (
          <div role="status" className="grid gap-4">
            <CardHeader>
              <StepIcon name="check" tone="success" />
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                You’re all set
              </CardTitle>
              <CardDescription>Your email is verified and your workspace is ready. Invite your team whenever you like.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-1">
              <Button className="w-full">
                Go to dashboard
                <Icon name="arrow-right" />
              </Button>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
}
