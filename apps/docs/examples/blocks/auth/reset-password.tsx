'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  Form,
  Icon,
  Label,
  PasswordInput,
  Progress,
} from 'ui-kit';

const RULES = [
  { id: 'length', label: 'At least 10 characters', test: (v: string) => v.length >= 10 },
  { id: 'case', label: 'Upper and lower case letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
  { id: 'symbol', label: 'At least one symbol, like ! or #', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: 'Too weak', tone: 'destructive' },
  { label: 'Too weak', tone: 'destructive' },
  { label: 'Weak', tone: 'warning' },
  { label: 'Good', tone: 'info' },
  { label: 'Strong', tone: 'success' },
] as const;

type Errors = { password?: string; confirm?: string };

export default function AuthResetPassword() {
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const prev = useRef(done);
  useEffect(() => {
    if (prev.current !== done) heading.current?.focus();
    prev.current = done;
  }, [done]);

  const passed = RULES.filter((r) => r.test(password)).length;
  const strength = STRENGTH[passed]!;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
    const next: Errors = {
      password: passed < RULES.length ? 'Your new password doesn’t meet every requirement yet.' : undefined,
      confirm: !confirm ? 'Type your new password again.' : confirm !== password ? 'Passwords don’t match.' : undefined,
    };
    setErrors(next);
    const firstInvalid = next.password ? 'password' : next.confirm ? 'confirm' : null;
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement | null)?.focus();
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 1000);
  };

  return (
    <div className="@container grid w-full place-items-center rounded-xl border border-border bg-muted px-4 py-10 @md:py-14">
      <Card className="w-full max-w-md @md:[--ui-card-padding:2rem]">
        {done ? (
          <div role="status" className="grid gap-4">
            <CardHeader>
              <span className="mb-2 grid size-11 place-items-center rounded-full bg-success text-success-foreground">
                <Icon name="check" size={20} />
              </span>
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                Password updated
              </CardTitle>
              <CardDescription>We signed you out on every other device. Use your new password next time you sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="#sign-in">Continue to sign in</a>
              </Button>
            </CardContent>
          </div>
        ) : (
          <>
            <CardHeader>
              <span className="mb-2 grid size-11 place-items-center rounded-full border border-border bg-muted">
                <Icon name="lock" size={20} />
              </span>
              <CardTitle ref={heading} tabIndex={-1} as="h1" className="text-xl outline-none">
                Choose a new password
              </CardTitle>
              <CardDescription>
                For <span className="font-medium text-foreground">ada@northwind.com</span>. Pick something you don’t use on other sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form noValidate onSubmit={submit} aria-label="Choose a new password">
                <Field invalid={!!errors.password}>
                  <Label>New password</Label>
                  <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                  />
                  <FieldError>{errors.password}</FieldError>
                </Field>

                <div className="grid gap-3 rounded-lg bg-muted p-3">
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Strength</span>
                      <span className="font-medium" aria-live="polite">
                        {password ? strength.label : '—'}
                      </span>
                    </div>
                    <Progress size="sm" value={passed} max={RULES.length} tone={strength.tone} aria-label="Password strength" getValueText={() => strength.label} />
                  </div>
                  <ul className="grid gap-1.5 text-sm" aria-label="Password requirements">
                    {RULES.map((rule) => {
                      const ok = rule.test(password);
                      return (
                        <li key={rule.id} className={ok ? 'flex items-center gap-2 text-foreground' : 'flex items-center gap-2 text-muted-foreground'}>
                          {ok ? (
                            <Icon name="circle-check" size={16} className="text-success-text" />
                          ) : (
                            <span className="grid size-4 place-items-center" aria-hidden="true">
                              <span className="size-1.5 rounded-full bg-current" />
                            </span>
                          )}
                          {rule.label}
                          <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <Field invalid={!!errors.confirm}>
                  <Label>Confirm new password</Label>
                  <PasswordInput
                    name="confirm"
                    autoComplete="new-password"
                    onChange={() => errors.confirm && setErrors((p) => ({ ...p, confirm: undefined }))}
                  />
                  <FieldError>{errors.confirm}</FieldError>
                </Field>
                <Button type="submit" className="w-full" loading={busy}>
                  Update password
                </Button>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
