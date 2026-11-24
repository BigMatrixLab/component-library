'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from 'ui-kit';

const INCLUDED = [
  'Unlimited services and environments',
  'Progressive rollouts with automatic rollback',
  'On-call scheduling for up to 25 people',
  'Help from a release engineer during setup',
];

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

export default function CtaCard() {
  const [ref, shown] = useReveal<HTMLDivElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-4 py-10 sm:px-8 sm:py-16">
      <div
        className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-6 sm:p-10 lg:p-12"
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in oklch, var(--ui-series-1) 8%, transparent), transparent 45%), radial-gradient(60% 80% at 100% 100%, color-mix(in oklch, var(--ui-series-5) 9%, transparent), transparent 70%)',
        }}
      >
        <div ref={ref} className={`grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14 ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary-text">Free for 14 days</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Ready when your next release is.</h2>
            <p className="mt-4 max-w-lg text-md text-muted-foreground sm:text-lg">
              Try every feature with your real services. If Halcyon is not for you, export your data and walk away. No
              sales call required.
            </p>
            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#">Start free trial</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#">Compare plans</a>
              </Button>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border bg-background p-5 sm:p-6">
            <p className="text-sm font-medium">Included in your trial</p>
            <ul className="mt-4 grid gap-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-md">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
                    <Icon name="check" size={12} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
