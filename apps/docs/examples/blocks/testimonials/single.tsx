'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatedNumber, Avatar, AvatarFallback, Icon } from 'ui-kit';

const STATS = [
  { value: 62, suffix: '%', label: 'fewer pages outside working hours' },
  { value: 40, suffix: '×', label: 'more releases per week' },
  { value: 4, suffix: ' min', label: 'median time to recover, down from 52' },
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

export default function TestimonialsSingle() {
  const [ref, shown] = useReveal<HTMLDivElement>();
  const titleId = useId();

  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl border border-border bg-background px-5 py-16 sm:px-8 sm:py-24"
      aria-labelledby={titleId}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(45% 60% at 0% 0%, color-mix(in oklch, var(--ui-series-2) 10%, transparent), transparent 70%)',
        }}
      />
      <div ref={ref} className={`mx-auto max-w-4xl ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}>
        <h2 id={titleId} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon name="star" fill="currentColor" strokeWidth={0} className="text-warning" />
          Customer story · Parallax
        </h2>

        <figure className="mt-8">
          <svg viewBox="0 0 32 24" className="h-6 w-8 text-border sm:h-8 sm:w-11" fill="currentColor" aria-hidden="true">
            <path d="M0 24V14C0 6.3 4.3 1.6 12 0l1.6 3.2C9.4 4.6 7.4 7.2 7.1 11H13v13H0Zm19 0V14c0-7.7 4.3-12.4 12-14l1.6 3.2C28.4 4.6 26.4 7.2 26.1 11H32v13H19Z" />
          </svg>
          <blockquote className="mt-6 font-display text-2xl leading-snug font-medium tracking-tight sm:text-3xl lg:text-[2.125rem] lg:leading-[1.3]">
            <p>
              Before Halcyon, Friday deploys were banned and every incident started with forty minutes of “what changed?”
              Now the answer is on screen before anyone joins the call, and we ship whenever the code is ready.
            </p>
          </blockquote>
          <figcaption className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>PN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Priya Natarajan</p>
                <p className="text-sm text-muted-foreground">VP Engineering, Parallax</p>
              </div>
            </div>
            <span className="hidden h-10 w-px bg-border sm:block" aria-hidden="true" />
            <a href="#" className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline hover:underline-offset-4">
              Read the full story
              <Icon name="arrow-right" size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </a>
          </figcaption>
        </figure>

        <dl className="mt-14 grid gap-8 border-t border-border pt-8 sm:grid-cols-3 sm:gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col-reverse gap-1">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-4xl font-semibold tracking-tight">
                <AnimatedNumber value={s.value} suffix={s.suffix} animateOnView />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
