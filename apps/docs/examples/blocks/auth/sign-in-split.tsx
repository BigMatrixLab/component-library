'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Avatar, AvatarFallback, Button, Checkbox, Field, FieldError, Form, Icon, Input, Label, PasswordInput, Separator } from 'ui-kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; password?: string };

/** Brand marks keep their own colours; everything else reads semantic tokens. */
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

function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-md font-semibold tracking-tight">
      <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <Icon name="activity" size={16} />
      </span>
      Lumen
    </span>
  );
}

export default function AuthSignInSplit() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [signedInAs, setSignedInAs] = useState('');
  // When the form is replaced by the welcome message, focus follows it
  const doneHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (status === 'done') doneHeading.current?.focus();
  }, [status]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const next: Errors = {
      email: !email ? 'Enter your email address.' : !EMAIL.test(email) ? 'Enter an email like name@company.com.' : undefined,
      password: !password ? 'Enter your password.' : undefined,
    };
    setErrors(next);
    const firstInvalid = next.email ? 'email' : next.password ? 'password' : null;
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement | null)?.focus();
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      setSignedInAs(email);
      setStatus('done');
    }, 1200);
  };

  const clear = (key: keyof Errors) => () => errors[key] && setErrors((prev) => ({ ...prev, [key]: undefined }));

  return (
    <div className="@container w-full overflow-hidden rounded-xl border border-border bg-background">
      <div className="grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Brand panel: only when there is room for two columns */}
        <div className="relative hidden flex-col justify-between gap-10 overflow-hidden border-r border-border bg-muted p-10 @3xl:flex">
          <Logo />
          <svg className="pointer-events-none absolute -top-24 -right-24 size-80 text-border" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            {[96, 76, 56, 36].map((r) => (
              <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" />
            ))}
          </svg>
          <figure className="relative grid gap-6">
            <blockquote className="font-display text-xl leading-relaxed font-medium tracking-tight">
              “We closed the books two days faster in our first month. Lumen gets out of the way and lets the numbers talk.”
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar size="md">
                <AvatarFallback>PR</AvatarFallback>
              </Avatar>
              <span className="grid text-sm">
                <span className="font-medium">Priya Raman</span>
                <span className="text-muted-foreground">Head of Finance, Northwind</span>
              </span>
            </figcaption>
          </figure>
          <ul className="relative grid gap-2 text-sm text-muted-foreground">
            {['SOC 2 Type II and GDPR ready', 'Single sign-on on every paid plan', 'Your data stays in the EU by default'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon name="circle-check" size={16} className="text-success-text" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[38rem] items-center justify-center px-5 py-10 @md:px-10">
          <div className="grid w-full max-w-sm gap-6">
            <div className="@3xl:hidden">
              <Logo />
            </div>

            {status === 'done' ? (
              <div role="status" className="grid justify-items-start gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-success text-success-foreground">
                  <Icon name="check" size={20} />
                </span>
                <h1 ref={doneHeading} tabIndex={-1} className="font-display text-2xl font-semibold tracking-tight outline-none">
                  Welcome back
                </h1>
                <p className="text-base text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{signedInAs}</span>. Taking you to your dashboard…
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')}>
                  Use another account
                </Button>
              </div>
            ) : (
              <>
                <header className="grid gap-1.5">
                  <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in to Lumen</h1>
                  <p className="text-base text-muted-foreground">Welcome back. Pick up where your team left off.</p>
                </header>

                <div className="grid gap-2 @sm:grid-cols-2">
                  <Button variant="outline" className="w-full">
                    <GoogleMark />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <GitHubMark />
                    GitHub
                  </Button>
                </div>

                <Separator>or continue with email</Separator>

                <Form noValidate onSubmit={submit} aria-label="Sign in">
                  <Field invalid={!!errors.email}>
                    <Label>Work email</Label>
                    <Input name="email" type="email" autoComplete="email" placeholder="ada@northwind.com" onChange={clear('email')} />
                    <FieldError>{errors.email}</FieldError>
                  </Field>
                  <Field invalid={!!errors.password}>
                    <div className="flex items-center justify-between gap-2">
                      <Label>Password</Label>
                      <a href="#forgot-password" className="text-sm font-medium text-primary-text hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <PasswordInput name="password" autoComplete="current-password" onChange={clear('password')} />
                    <FieldError>{errors.password}</FieldError>
                  </Field>
                  <Checkbox name="remember" defaultChecked label="Keep me signed in for 30 days" />
                  <Button type="submit" className="w-full" loading={status === 'loading'}>
                    Sign in
                  </Button>
                </Form>

                <p className="text-center text-sm text-muted-foreground">
                  New to Lumen?{' '}
                  <a href="#sign-up" className="font-medium text-primary-text hover:underline">
                    Create an account
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
