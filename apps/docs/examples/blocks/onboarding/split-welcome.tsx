'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button, Checkbox, Icon, Progress, RadioGroup, RadioGroupItem } from 'ui-kit';

const ROLES = [
  { id: 'engineering', label: 'Engineering', description: 'I build and ship code.' },
  { id: 'design', label: 'Design', description: 'I prototype and own the design system.' },
  { id: 'product', label: 'Product', description: 'I plan releases and track impact.' },
  { id: 'operations', label: 'Operations', description: 'I keep production healthy.' },
];

const TEAM_SIZES = [
  { id: 'solo', label: 'Just me' },
  { id: 'small', label: '2 to 10' },
  { id: 'medium', label: '11 to 50' },
  { id: 'large', label: '51 or more' },
];

const GOALS = [
  { id: 'deploy', label: 'Deploy an app', description: 'Ship a project from Git in a few minutes.' },
  { id: 'previews', label: 'Preview every pull request', description: 'A live link for each branch, for review.' },
  { id: 'monitor', label: 'Monitor errors', description: 'Alerts when a release breaks something.' },
  { id: 'oncall', label: 'Set up on-call', description: 'Rotations, escalations and paging.' },
];

const QUESTIONS = ['What best describes your work?', 'How big is your team?', 'What do you want to do first?'];

const PERKS = [
  'A dashboard arranged around your role',
  'Starter templates that match your stack',
  'Sensible alert defaults for your team size',
];

export default function OnboardingSplitWelcome() {
  const [question, setQuestion] = useState(1);
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [error, setError] = useState('');

  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(question);

  useEffect(() => {
    if (shownStep.current === question) return;
    shownStep.current = question;
    headingRef.current?.focus();
  }, [question]);

  const total = QUESTIONS.length;
  const done = question > total;
  const answered = Math.min(question - 1, total);
  const questionId = `${uid}-question`;
  const errorId = `${uid}-error`;

  const go = (next: number) => {
    setError('');
    setQuestion(next);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const missing =
      (question === 1 && !role) || (question === 2 && !teamSize)
        ? 'Choose one option to continue.'
        : question === 3 && goals.length === 0
          ? 'Pick at least one so we know where to start.'
          : '';
    if (missing) {
      setError(missing);
      groupRef.current?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    go(question + 1);
  };

  const summary = [
    ROLES.find((r) => r.id === role)?.label,
    teamSize === 'solo' ? 'Solo' : teamSize ? `${TEAM_SIZES.find((t) => t.id === teamSize)?.label} people` : undefined,
    ...goals.map((g) => GOALS.find((x) => x.id === g)?.label),
  ].filter(Boolean) as string[];

  return (
    <section className="@container overflow-hidden rounded-2xl border border-border bg-background">
      <div className="grid @3xl:min-h-[36rem] @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <aside className="grid content-between gap-8 bg-primary p-6 text-primary-foreground @2xl:p-10">
          <div className="grid gap-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground text-primary">
                <Icon name="zap" size={16} />
              </span>
              <span className="text-md font-semibold">Halcyon</span>
            </div>
            <div className="grid gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight @2xl:text-3xl">
                Welcome aboard, Amina. Let&apos;s tailor Halcyon to your team.
              </h2>
              <p className="max-w-md text-md text-primary-foreground/90">
                Three quick questions. Your answers only shape what you see first; nothing is locked in.
              </p>
            </div>
          </div>
          <ul className="hidden gap-3 text-sm @3xl:grid">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-primary-foreground/90">
                <Icon name="check" size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid min-w-0 content-start gap-8 p-5 @2xl:p-10">
          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium tabular-nums">
                {done ? 'All done' : `Question ${question} of ${total}`}
              </span>
              {!done && (
                <Button variant="link" size="sm" className="h-auto px-0" onClick={() => go(total + 1)}>
                  Skip for now
                </Button>
              )}
            </div>
            <Progress
              value={done ? total : answered}
              max={total}
              size="sm"
              aria-label="Personalisation progress"
              getValueText={(v, m) => `${v} of ${m} questions answered`}
            />
          </div>

          {done ? (
            <div key="done" className="ui-stagger grid justify-items-start gap-5">
              <span className="grid size-12 place-items-center rounded-full bg-success text-success-foreground ring-8 ring-success/15">
                <Icon name="sparkles" size={22} />
              </span>
              <div className="grid gap-2">
                <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold tracking-tight outline-none">
                  Your workspace is tailored
                </h3>
                <p className="max-w-prose text-md text-muted-foreground">
                  {summary.length > 0
                    ? 'We arranged your dashboard around what you told us. Change it any time in Settings, Personalisation.'
                    : 'We kept the standard dashboard. You can personalise it any time in Settings.'}
                </p>
              </div>
              {summary.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Your answers">
                  {summary.map((item) => (
                    <li key={item} className="rounded-full border border-border bg-card px-3 py-1 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex w-full flex-col gap-2.5 @md:flex-row">
                <Button asChild>
                  <a href="#">
                    Go to dashboard
                    <Icon name="arrow-right" />
                  </a>
                </Button>
                <Button variant="outline" onClick={() => go(1)}>
                  Edit answers
                </Button>
              </div>
            </div>
          ) : (
            <form key={question} noValidate onSubmit={submit} className="ui-animate-rise grid gap-6">
              <h3
                ref={headingRef}
                id={questionId}
                tabIndex={-1}
                className="font-display text-xl font-semibold tracking-tight outline-none"
              >
                {QUESTIONS[question - 1]}
              </h3>

              <div ref={groupRef} className="grid gap-3">
                {question === 1 && (
                  <RadioGroup
                    variant="card"
                    value={role}
                    onValueChange={(v) => {
                      setRole(v);
                      setError('');
                    }}
                    name="role"
                    invalid={!!error}
                    aria-labelledby={questionId}
                    aria-describedby={error ? errorId : undefined}
                  >
                    {ROLES.map((r) => (
                      <RadioGroupItem key={r.id} value={r.id} label={r.label} description={r.description} />
                    ))}
                  </RadioGroup>
                )}

                {question === 2 && (
                  <RadioGroup
                    variant="card"
                    orientation="horizontal"
                    value={teamSize}
                    onValueChange={(v) => {
                      setTeamSize(v);
                      setError('');
                    }}
                    name="team-size"
                    invalid={!!error}
                    aria-labelledby={questionId}
                    aria-describedby={error ? errorId : undefined}
                  >
                    {TEAM_SIZES.map((t) => (
                      <RadioGroupItem key={t.id} value={t.id} label={t.label} />
                    ))}
                  </RadioGroup>
                )}

                {question === 3 && (
                  <div
                    role="group"
                    aria-labelledby={questionId}
                    aria-describedby={error ? errorId : undefined}
                    className="grid gap-2"
                  >
                    {GOALS.map((g) => (
                      <Checkbox
                        key={g.id}
                        variant="card"
                        name="goals"
                        value={g.id}
                        checked={goals.includes(g.id)}
                        invalid={!!error}
                        onCheckedChange={(checked) => {
                          setGoals((list) => (checked ? [...list, g.id] : list.filter((x) => x !== g.id)));
                          setError('');
                        }}
                        label={g.label}
                        description={g.description}
                      />
                    ))}
                  </div>
                )}

                {error && (
                  <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-destructive-text">
                    <Icon name="circle-alert" size={14} />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
                {question > 1 ? (
                  <Button type="button" variant="outline" onClick={() => go(question - 1)}>
                    <Icon name="arrow-left" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="submit" className="ml-auto">
                  {question === total ? 'Finish' : 'Continue'}
                  <Icon name={question === total ? 'check' : 'arrow-right'} />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
