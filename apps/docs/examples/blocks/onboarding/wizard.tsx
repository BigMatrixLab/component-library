'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import {
  Badge,
  Button,
  Field,
  FieldError,
  FieldHint,
  Icon,
  Input,
  InputAddon,
  InputGroup,
  Label,
  RadioGroup,
  RadioGroupItem,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  TagInput,
} from 'ui-kit';

const STEPS = [
  { title: 'Workspace', description: 'Name and address' },
  { title: 'Team', description: 'Invite teammates' },
  { title: 'Plan', description: 'Plan and colour' },
];

const PLANS = [
  { id: 'hobby', name: 'Hobby', price: '$0', blurb: '1 project and 100 GB of bandwidth.' },
  { id: 'pro', name: 'Pro', price: '$20', blurb: 'Unlimited projects and preview deploys.' },
  { id: 'team', name: 'Team', price: '$45', blurb: 'Roles, single sign-on and an audit log.' },
];

const ACCENTS = [
  { id: 'neutral', name: 'Default' },
  { id: 'violet', name: 'Violet' },
  { id: 'blue', name: 'Blue' },
  { id: 'emerald', name: 'Emerald' },
  { id: 'rose', name: 'Rose' },
  { id: 'amber', name: 'Amber' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
const TAKEN = ['acme', 'halcyon', 'admin'];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function nameError(name: string) {
  return name.trim().length < 2 ? 'Enter a workspace name of at least 2 characters.' : '';
}

function slugError(slug: string) {
  if (!SLUG.test(slug)) return 'Use 3 to 32 lowercase letters, numbers or hyphens, not starting or ending with a hyphen.';
  if (TAKEN.includes(slug)) return `halcyon.app/${slug} is taken. Try another address.`;
  return '';
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [triedWorkspace, setTriedWorkspace] = useState(false);
  const [invites, setInvites] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState('');
  const [plan, setPlan] = useState('pro');
  const [accent, setAccent] = useState('neutral');

  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const inviteRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  const uid = useId();

  // Move focus to the new step's heading so screen readers hear where they are (not on first load)
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus();
  }, [step]);

  const done = step > STEPS.length;
  const errors = triedWorkspace ? { name: nameError(name), slug: slugError(slug) } : { name: '', slug: '' };
  const planName = PLANS.find((p) => p.id === plan)?.name ?? 'Pro';

  const submitWorkspace = (e: FormEvent) => {
    e.preventDefault();
    setTriedWorkspace(true);
    if (nameError(name)) return nameRef.current?.focus();
    if (slugError(slug)) return slugRef.current?.focus();
    setStep(2);
  };

  const submitTeam = (e: FormEvent) => {
    e.preventDefault();
    const leftover = inviteRef.current?.value.trim();
    if (leftover) {
      setInviteError(`${leftover} is not a valid email address. Fix it or clear the field.`);
      return inviteRef.current?.focus();
    }
    setInviteError('');
    setStep(3);
  };

  const submitPlan = (e: FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <section
      data-accent={accent === 'neutral' ? undefined : accent}
      className="@container rounded-2xl border border-border bg-background px-4 py-8 @2xl:px-8 @2xl:py-12"
    >
      <div className="mx-auto grid w-full max-w-2xl gap-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Icon name="zap" size={16} />
            </span>
            <span className="truncate text-md font-semibold">Halcyon</span>
          </div>
          <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {done ? 'Setup complete' : `Step ${step} of ${STEPS.length}`}
          </p>
        </header>

        <Stepper value={step} onValueChange={setStep} aria-label="Workspace setup">
          {STEPS.map((s, i) => (
            <StepperItem key={s.title} step={i + 1} disabled={i + 1 > step || done}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperContent>
                  <StepperTitle>{s.title}</StepperTitle>
                  <StepperDescription>{s.description}</StepperDescription>
                </StepperContent>
              </StepperTrigger>
              {i < STEPS.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>

        <div key={step} className="ui-animate-rise min-w-0 rounded-xl border border-border bg-card p-5 @2xl:p-8">
          {step === 1 && (
            <form noValidate onSubmit={submitWorkspace} className="grid gap-6">
              <StepHeading headingRef={headingRef} title="Create your workspace">
                A workspace holds your projects, deploys and team. You can rename it later.
              </StepHeading>
              <Field required>
                <Label>Workspace name</Label>
                <Input
                  ref={nameRef}
                  value={name}
                  autoComplete="organization"
                  placeholder="Northwind Labs"
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugEdited) setSlug(slugify(e.target.value));
                  }}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field required>
                <Label>Workspace address</Label>
                <InputGroup>
                  <InputAddon>halcyon.app/</InputAddon>
                  <Input
                    ref={slugRef}
                    value={slug}
                    placeholder="northwind-labs"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase());
                      setSlugEdited(true);
                    }}
                  />
                </InputGroup>
                <FieldHint>Lowercase letters, numbers and hyphens. Teammates use it to sign in.</FieldHint>
                <FieldError>{errors.slug}</FieldError>
              </Field>
              <StepActions>
                <Button type="submit">
                  Continue
                  <Icon name="arrow-right" />
                </Button>
              </StepActions>
            </form>
          )}

          {step === 2 && (
            <form noValidate onSubmit={submitTeam} className="grid gap-6">
              <StepHeading headingRef={headingRef} title="Invite your teammates">
                They get an email with a link to join {name.trim() || 'your workspace'}. Invites expire after 7 days.
              </StepHeading>
              <Field>
                <Label>Email addresses</Label>
                <TagInput
                  ref={inviteRef}
                  value={invites}
                  onValueChange={(next) => {
                    setInvites(next);
                    setInviteError('');
                  }}
                  onTagRejected={(tag, reason, message) =>
                    setInviteError(
                      reason === 'duplicate'
                        ? `${tag} is already on the list.`
                        : reason === 'max'
                          ? 'You can invite up to 10 people now, and more from Settings later.'
                          : (message ?? `${tag} is not a valid email address.`),
                    )
                  }
                  validate={(tag) => EMAIL.test(tag) || `${tag} is not a valid email address.`}
                  maxTags={10}
                  inputMode="email"
                  placeholder={invites.length ? 'Add another' : 'name@company.com'}
                  name="invites"
                />
                <FieldHint>Press Enter or comma to add. Paste a list to add several at once.</FieldHint>
                <FieldError>{inviteError}</FieldError>
              </Field>
              <div className="grid gap-3">
                <p id={`${uid}-invite-role-label`} className="text-sm font-medium">
                  Invite as
                </p>
                <RadioGroup
                  orientation="horizontal"
                  value={inviteRole}
                  onValueChange={setInviteRole}
                  name="invite-role"
                  aria-labelledby={`${uid}-invite-role-label`}
                >
                  <RadioGroupItem value="member" label="Member" description="Can deploy and edit projects." />
                  <RadioGroupItem value="admin" label="Admin" description="Also manages billing and people." />
                </RadioGroup>
              </div>
              <StepActions onBack={() => setStep(1)}>
                {invites.length === 0 && (
                  <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                    Skip for now
                  </Button>
                )}
                <Button type="submit">
                  {invites.length === 0 ? 'Continue' : `Send ${invites.length} ${invites.length === 1 ? 'invite' : 'invites'}`}
                  <Icon name="arrow-right" />
                </Button>
              </StepActions>
            </form>
          )}

          {step === 3 && (
            <form noValidate onSubmit={submitPlan} className="grid gap-6">
              <StepHeading headingRef={headingRef} title="Pick a plan and a colour">
                Every paid plan starts with a 14-day trial. No card needed until it ends.
              </StepHeading>
              <div className="grid gap-3">
                <p id={`${uid}-plan-label`} className="text-sm font-medium">
                  Plan
                </p>
                <RadioGroup
                  variant="card"
                  orientation="horizontal"
                  value={plan}
                  onValueChange={setPlan}
                  name="plan"
                  aria-labelledby={`${uid}-plan-label`}
                >
                  {PLANS.map((p) => (
                    <RadioGroupItem
                      key={p.id}
                      value={p.id}
                      label={
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          {p.name}
                          <span className="font-normal tabular-nums text-muted-foreground">{p.price}/mo</span>
                        </span>
                      }
                      description={p.blurb}
                    />
                  ))}
                </RadioGroup>
              </div>
              <div className="grid gap-3">
                <p id={`${uid}-accent-label`} className="text-sm font-medium">
                  Accent colour
                </p>
                <RadioGroup
                  orientation="horizontal"
                  value={accent}
                  onValueChange={setAccent}
                  name="accent"
                  aria-labelledby={`${uid}-accent-label`}
                  aria-describedby={`${uid}-accent-hint`}
                >
                  {ACCENTS.map((a) => (
                    <RadioGroupItem
                      key={a.id}
                      value={a.id}
                      label={
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            data-accent={a.id === 'neutral' ? undefined : a.id}
                            className="size-3.5 shrink-0 rounded-full bg-primary"
                          />
                          {a.name}
                        </span>
                      }
                    />
                  ))}
                </RadioGroup>
                <p id={`${uid}-accent-hint`} className="text-sm text-muted-foreground">
                  Used for buttons, links and selected items. This page previews it as you choose.
                </p>
              </div>
              <StepActions onBack={() => setStep(2)}>
                <Button type="submit">
                  Finish setup
                  <Icon name="check" />
                </Button>
              </StepActions>
            </form>
          )}

          {done && (
            <div className="ui-stagger grid justify-items-start gap-5">
              <span className="grid size-12 place-items-center rounded-full bg-success text-success-foreground ring-8 ring-success/15">
                <Icon name="check" size={24} strokeWidth={2.5} />
              </span>
              <div className="grid gap-2">
                <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold tracking-tight outline-none">
                  {name.trim() || 'Your workspace'} is ready
                </h2>
                <p className="max-w-prose text-md text-muted-foreground">
                  {invites.length > 0
                    ? `We sent ${invites.length} ${invites.length === 1 ? 'invite' : 'invites'}. `
                    : 'You can invite your team any time from Settings. '}
                  {plan === 'hobby' ? 'You are on the free Hobby plan.' : `Your ${planName} trial runs until December 9.`}
                </p>
              </div>
              <dl className="grid w-full gap-x-6 gap-y-3 rounded-lg border border-border p-4 text-sm @md:grid-cols-[auto_1fr]">
                <SummaryRow term="Address">
                  <span className="break-all">halcyon.app/{slug}</span>
                </SummaryRow>
                <SummaryRow term="Invites">
                  {invites.length > 0 ? (
                    <span className="flex flex-wrap items-center gap-2">
                      {invites.length} pending
                      <Badge variant="secondary" size="sm">
                        {inviteRole === 'admin' ? 'Admins' : 'Members'}
                      </Badge>
                    </span>
                  ) : (
                    'None yet'
                  )}
                </SummaryRow>
                <SummaryRow term="Plan">{plan === 'hobby' ? 'Hobby, free' : `${planName}, 14-day trial`}</SummaryRow>
              </dl>
              <div className="flex w-full flex-col gap-2.5 @md:flex-row">
                <Button asChild>
                  <a href="#">
                    Open your dashboard
                    <Icon name="arrow-right" />
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setStep(3)}>
                  Change something
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepHeading({
  headingRef,
  title,
  children,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-xl font-semibold tracking-tight outline-none">
        {title}
      </h2>
      <p className="max-w-prose text-md text-muted-foreground">{children}</p>
    </div>
  );
}

function StepActions({ onBack, children }: { onBack?: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          <Icon name="arrow-left" />
          Back
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex flex-wrap justify-end gap-2">{children}</div>
    </div>
  );
}

function SummaryRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </>
  );
}
