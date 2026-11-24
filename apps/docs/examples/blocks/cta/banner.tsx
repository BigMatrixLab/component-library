'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from 'ui-kit';

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

export default function CtaBanner() {
  const [ref, shown] = useReveal<HTMLDivElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-4 py-10 sm:px-8 sm:py-16">
      <div
        ref={ref}
        className={`relative isolate mx-auto max-w-6xl overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14 ${shown ? 'ui-animate-rise' : 'motion-safe:opacity-0'}`}
      >
        {/* Two soft glows in the series colours: marketing blocks only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(50% 120% at 100% 0%, color-mix(in oklch, var(--ui-series-1) 32%, transparent), transparent 70%), radial-gradient(40% 90% at 85% 100%, color-mix(in oklch, var(--ui-series-2) 22%, transparent), transparent 70%)',
          }}
        />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Make your next release the calmest one yet.</h2>
            <p className="mt-4 text-md text-primary-foreground/90 sm:text-lg">
              Connect a repository and ship your first progressive rollout in under ten minutes. Free for 14 days, no
              credit card needed.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="#">
                Start free trial
                <Icon name="arrow-right" />
              </a>
            </Button>
            <a
              href="#"
              className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-md font-medium text-primary-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
