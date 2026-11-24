'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, Icon, type IconName } from 'ui-kit';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, shown] as const;
}

/** The visual frame: a quiet well with a subtle gradient, the mock card inside it. */
function Frame({ label, hue, children }: { label: string; hue: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-6"
      style={{ backgroundImage: `radial-gradient(70% 70% at 30% 0%, color-mix(in oklch, var(${hue}) 13%, transparent), transparent 70%)` }}
    >
      <div className="rounded-xl border border-border bg-card p-4">{children}</div>
    </div>
  );
}

function RolloutVisual() {
  const steps = [
    { label: 'Canary · 1%', state: 'done', note: '4 min' },
    { label: 'Early · 10%', state: 'done', note: '12 min' },
    { label: 'Half · 50%', state: 'active', note: 'Checking' },
    { label: 'Everyone · 100%', state: 'waiting', note: 'Waiting' },
  ];
  return (
    <Frame label="A release moving through four rollout stages, halfway done" hue="--ui-series-1">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-sm">v4.12.0</p>
        <Badge variant="info" size="sm" dot>
          Rolling out
        </Badge>
      </div>
      <ol className="mt-4 grid gap-3">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                s.state === 'done' ? 'bg-success text-success-foreground' : s.state === 'active' ? 'border-2 border-info' : 'border border-border'
              }`}
            >
              {s.state === 'done' && <Icon name="check" size={12} strokeWidth={2.5} />}
            </span>
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <span className="text-xs text-muted-foreground">{s.note}</span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function FlagsVisual() {
  return (
    <Frame label="A feature flag targeting Pro customers in Europe, at 25 percent" hue="--ui-series-2">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-sm">new-checkout</p>
        <span className="flex h-5 w-9 shrink-0 justify-end rounded-full bg-primary p-0.5">
          <span className="size-4 rounded-full bg-background" />
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        {[
          ['plan', 'is', 'Pro, Enterprise'],
          ['region', 'in', 'EU'],
        ].map(([field, op, value]) => (
          <div key={field} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border px-3 py-2">
            <span className="font-mono text-xs">{field}</span>
            <span className="text-xs text-muted-foreground">{op}</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Rollout</span>
          <span className="tabular-nums">25%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/4 rounded-full bg-series-2" />
        </div>
      </div>
    </Frame>
  );
}

function OnCallVisual() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const shifts = [
    { who: 'Amina', span: 'col-span-2', tone: 'bg-series-1' },
    { who: 'Jonas', span: 'col-span-2', tone: 'bg-series-2' },
    { who: 'Mei', span: 'col-span-1', tone: 'bg-series-5' },
  ];
  return (
    <Frame label="An on-call rotation for the week, shared between three engineers" hue="--ui-series-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Payments on-call</p>
        <span className="text-xs text-muted-foreground">This week</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5 text-center text-xs text-muted-foreground">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {shifts.map((s) => (
          <span key={s.who} className={`${s.span} flex h-8 items-center rounded-md bg-muted px-2`}>
            <span className={`mr-2 h-4 w-1 shrink-0 rounded-full ${s.tone}`} />
            <span className="truncate text-xs font-medium">{s.who}</span>
          </span>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="clock" size={14} />
        Hand-off Wednesday 09:00, with a summary of open alerts
      </p>
    </Frame>
  );
}

const ROWS: { icon: IconName; eyebrow: string; title: string; body: string; points: string[]; visual: ReactNode }[] = [
  {
    icon: 'zap',
    eyebrow: 'Rollouts',
    title: 'Watch every release land, stage by stage.',
    body: 'Pick the stages once. Halcyon moves each release forward only when error rate and latency match the version it replaces.',
    points: ['Health checks between every stage', 'Pause, resume or roll back from Slack', 'Per-region schedules and freeze windows'],
    visual: <RolloutVisual />,
  },
  {
    icon: 'filter',
    eyebrow: 'Feature flags',
    title: 'Turn features on for exactly the right people.',
    body: 'Ship dark, then target by plan, region or account. Flags evaluate locally in under a millisecond, so they never slow a request.',
    points: ['Targeting rules anyone on the team can read', 'Percentage rollouts with sticky assignment', 'Stale flag reminders after 30 days'],
    visual: <FlagsVisual />,
  },
  {
    icon: 'users',
    eyebrow: 'On-call',
    title: 'Hand-offs that never drop the pager.',
    body: 'Rotations, overrides and escalation in one calendar. Every hand-off comes with a short summary of what is still open.',
    points: ['Follow-the-sun rotations across time zones', 'Overrides in two taps from your phone', 'Fair-load reports for every team'],
    visual: <OnCallVisual />,
  },
];

export default function FeaturesAlternating() {
  const [listRef, shown] = useReveal<HTMLDivElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">One workflow, from merge to morning.</h2>
          <p className="mt-4 text-md text-muted-foreground sm:text-lg">
            Three tools most teams glue together by hand, designed to work as one.
          </p>
        </div>

        <div ref={listRef} className={`mt-14 grid gap-16 sm:mt-20 sm:gap-24 ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}>
          {ROWS.map((row, i) => (
            <div key={row.eyebrow} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={`min-w-0 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <p className="flex items-center gap-2 text-sm font-medium text-primary-text">
                  <Icon name={row.icon} />
                  {row.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{row.title}</h3>
                <p className="mt-4 text-md text-muted-foreground">{row.body}</p>
                <ul className="mt-6 grid gap-2.5">
                  {row.points.map((p) => (
                    <li key={p} className="flex gap-3 text-md">
                      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-success-text" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline hover:underline-offset-4"
                >
                  Learn about {row.eyebrow.toLowerCase()}
                  <Icon name="arrow-right" size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </a>
              </div>
              <div className={`min-w-0 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>{row.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
