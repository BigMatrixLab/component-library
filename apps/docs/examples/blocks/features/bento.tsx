'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from 'ui-kit';

const STAGES = ['1%', '10%', '50%', '100%'];
/** Rollout progress per region: finished stages, plus how far into the current one (0–1). */
const REGIONS = [
  { name: 'eu-west-1', done: 3, current: 0.7 },
  { name: 'us-east-1', done: 2, current: 0.4 },
  { name: 'ap-south-1', done: 1, current: 0.9 },
];

const FLAGS = [
  { key: 'new-checkout', rollout: '25%', on: true },
  { key: 'smart-retry', rollout: '100%', on: true },
  { key: 'dark-launch-search', rollout: '0%', on: false },
];

/** 45 days of uptime: one bar per day; the incidents are on day 17 and 35. */
const UPTIME = Array.from({ length: 45 }, (_, i) => (i === 17 ? 'bg-warning' : i === 35 ? 'bg-destructive' : 'bg-success'));

const INTEGRATIONS = ['GitHub', 'Slack', 'Datadog', 'Terraform', 'PagerDuty', 'Jira', 'Sentry', 'Grafana'];

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

function Tile({ title, body, className = '', style, children }: { title: string; body: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <li className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`} style={style}>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-md text-muted-foreground">{body}</p>
      <div className="mt-auto pt-6" aria-hidden="true">
        {children}
      </div>
    </li>
  );
}

export default function FeaturesBento() {
  const [gridRef, shown] = useReveal<HTMLUListElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary-text">Why teams switch</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">Release safely, at any scale.</h2>
          <p className="mt-4 text-md text-muted-foreground sm:text-lg">
            The guardrails big platform teams build in-house, ready on day one for a team of five.
          </p>
        </div>

        <ul
          ref={gridRef}
          className={`mt-12 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4 ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}
        >
          <Tile
            title="Region-by-region rollouts"
            body="Each region moves through the stages on its own clock and pauses by itself when its health checks disagree."
            className="sm:col-span-2 lg:col-span-4 lg:row-span-2"
          >
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <div className="grid items-center gap-x-3 gap-y-2 sm:grid-cols-[6rem_1fr] sm:gap-y-3">
                <span className="hidden sm:block" />
                <div className="grid grid-cols-4 gap-1.5 text-xs text-muted-foreground tabular-nums">
                  {STAGES.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                {REGIONS.map((r) => (
                  <div key={r.name} className="contents">
                    <span className="truncate font-mono text-xs">{r.name}</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {STAGES.map((s, i) => (
                        <span key={s} className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-series-1"
                            style={{ width: i < r.done ? '100%' : i === r.done ? `${r.current * 100}%` : '0%' }}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success" /> Error rate 0.02%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success" /> p95 214ms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success" /> Saturation 41%
                </span>
              </div>
            </div>
          </Tile>

          <Tile title="Feature flags" body="Decouple deploy from release. Target by plan, region or a single customer." className="lg:col-span-2">
            <ul className="grid gap-2">
              {FLAGS.map((f) => (
                <li key={f.key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{f.key}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{f.rollout}</span>
                  <span className={`flex h-4 w-7 shrink-0 rounded-full p-0.5 ${f.on ? 'justify-end bg-primary' : 'bg-border'}`}>
                    <span className="size-3 rounded-full bg-background" />
                  </span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile title="Public status page" body="Updates post themselves from the incident timeline." className="lg:col-span-2">
            <div className="flex h-9 items-stretch gap-px sm:gap-[2px]">
              {UPTIME.map((tone, i) => (
                <span key={i} className={`min-w-0 flex-1 rounded-[2px] ${tone}`} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>45 days ago</span>
              <span className="tabular-nums">99.98% uptime</span>
            </div>
          </Tile>

          <Tile title="Works with your stack" body="Two-way sync with the tools you already page, plan and deploy with." className="lg:col-span-3">
            <div className="flex flex-wrap gap-2">
              {INTEGRATIONS.map((name) => (
                <span key={name} className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold">{name[0]}</span>
                  {name}
                </span>
              ))}
            </div>
          </Tile>

          <Tile
            title="An audit trail auditors like"
            body="Every production change is reviewed, signed and exportable for SOC 2 and ISO 27001."
            className="lg:col-span-3"
            style={{
              backgroundImage:
                'radial-gradient(80% 90% at 100% 100%, color-mix(in oklch, var(--ui-series-1) 12%, transparent), transparent 70%)',
            }}
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-5xl font-semibold tracking-tight tabular-nums">100%</p>
                <p className="mt-1 text-sm text-muted-foreground">of changes reviewed last quarter</p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background">
                <Icon name="lock" size={22} />
              </span>
            </div>
          </Tile>
        </ul>
      </div>
    </section>
  );
}
