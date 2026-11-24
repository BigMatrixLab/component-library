'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from 'ui-kit';

const QUOTES = [
  {
    quote:
      'We went from two releases a week to forty a day, and our change failure rate went down. Halcyon made the safe path the easy path, so nobody argues with it.',
    name: 'Priya Natarajan',
    role: 'VP Engineering',
    company: 'Parallax',
    featured: true,
  },
  {
    quote: 'The first tool our on-call engineers asked us to keep after the trial ended.',
    name: 'Daniel Okafor',
    role: 'SRE lead',
    company: 'Quanta',
  },
  {
    quote:
      'Rollbacks used to be a war room. Now a bot posts “rolled back v4.12.1 in 41s” in Slack and we fix it in the morning.',
    name: 'Lena Fischer',
    role: 'Staff engineer',
    company: 'Foundry',
  },
  {
    quote: 'Our auditors asked how we produced the change log so quickly. We exported it from Halcyon in one click.',
    name: 'Marcus Chen',
    role: 'Head of Security',
    company: 'Meridian',
  },
  {
    quote:
      'Feature flags, deploys and incidents finally share one timeline. When something breaks, the cause is usually the first thing on screen.',
    name: 'Sofia Alvarez',
    role: 'Engineering manager',
    company: 'Copperleaf',
  },
  {
    quote: 'Setup took an afternoon. Pages at night dropped by 62% in the first month.',
    name: 'Tom Becker',
    role: 'CTO',
    company: 'Northbeam',
  },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

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

export default function TestimonialsQuoteGrid() {
  const [gridRef, shown] = useReveal<HTMLUListElement>();

  return (
    <section className="rounded-2xl border border-border bg-background px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary-text">Customers</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">Loved by the people who carry the pager.</h2>
        </div>

        <ul
          ref={gridRef}
          className={`mt-12 columns-1 gap-4 sm:mt-14 md:columns-2 lg:columns-3 ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}
        >
          {QUOTES.map((q) => (
            <li key={q.name} className="mb-4 break-inside-avoid">
              <figure
                className={`flex flex-col gap-6 rounded-2xl border border-border p-6 ${q.featured ? 'bg-card' : 'bg-background'}`}
                style={
                  q.featured
                    ? { backgroundImage: 'linear-gradient(160deg, color-mix(in oklch, var(--ui-series-1) 9%, transparent), transparent 60%)' }
                    : undefined
                }
              >
                <blockquote className={q.featured ? 'text-lg leading-relaxed font-medium' : 'text-md leading-relaxed'}>
                  <p>“{q.quote}”</p>
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(q.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{q.name}</p>
                    <p className="text-muted-foreground">
                      {q.role}, {q.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
