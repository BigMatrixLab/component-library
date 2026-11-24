'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from 'ui-kit';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'zap',
    title: 'Progressive rollouts',
    body: 'Ship to 1%, then 10%, then everyone. Each step waits for your health checks before it moves on.',
  },
  {
    icon: 'activity',
    title: 'Automatic health checks',
    body: 'Error rate, latency and saturation are compared with the last good release, not a static threshold.',
  },
  {
    icon: 'refresh-cw',
    title: 'One-click rollback',
    body: 'Restore the previous version in every region at once. Average rollback time across customers: 38 seconds.',
  },
  {
    icon: 'bell',
    title: 'Paging that respects sleep',
    body: 'Alerts are grouped by cause and routed to whoever owns the service, with quiet hours for everything else.',
  },
  {
    icon: 'lock',
    title: 'Approvals and audit log',
    body: 'Require a second reviewer for production, and keep a signed record of who shipped what and when.',
  },
  {
    icon: 'bar-chart',
    title: 'DORA metrics, built in',
    body: 'Deploy frequency, lead time, change failure rate and recovery time, tracked per team from day one.',
  },
];

/** Plays the kit's stagger entrance once, when the group first scrolls into view. */
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

export default function FeaturesIconGrid() {
  const [gridRef, shown] = useReveal<HTMLUListElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-medium text-primary-text">Platform</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Everything between merge and production.
            </h2>
          </div>
          <p className="max-w-xl text-md text-muted-foreground sm:text-lg">
            Halcyon replaces the deploy script, the flag service and the on-call spreadsheet with one tool your whole
            team already understands.
          </p>
        </div>

        <ul
          ref={gridRef}
          className={`mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}
        >
          {FEATURES.map((f) => (
            <li key={f.title} className="border-t border-border pt-6">
              <span className="grid size-10 place-items-center rounded-lg border border-border bg-muted text-foreground">
                <Icon name={f.icon} size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-md text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
