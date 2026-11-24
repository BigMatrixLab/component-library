'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, Button } from 'ui-kit';

const QUOTES = [
  { quote: 'Rollbacks went from a war room to a Slack message.', name: 'Lena Fischer', role: 'Staff engineer, Foundry' },
  { quote: 'The first tool our on-call team begged us to keep after the trial.', name: 'Daniel Okafor', role: 'SRE lead, Quanta' },
  { quote: 'We ship on Fridays again. Nobody has noticed, which is the point.', name: 'Priya Natarajan', role: 'VP Engineering, Parallax' },
  { quote: 'Audit prep used to take two weeks. Now it is one export.', name: 'Marcus Chen', role: 'Head of Security, Meridian' },
  { quote: 'Night pages dropped 62% in the first month.', name: 'Tom Becker', role: 'CTO, Northbeam' },
  { quote: 'Flags, deploys and incidents on one timeline. The cause is usually right there.', name: 'Sofia Alvarez', role: 'Engineering manager, Copperleaf' },
  { quote: 'Set up in an afternoon, trusted by the end of the week.', name: 'Yusuf Kaya', role: 'Platform lead, Lattice' },
  { quote: 'Our change failure rate halved while deploys tripled.', name: 'Hannah Moore', role: 'Director of Engineering, Brightwave' },
];

/** Scroll speed of the row, in px per second. */
const SPEED = 36;

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

/** True when the visitor asked for reduced motion; follows changes live. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function QuoteCard({ quote, name, role }: (typeof QUOTES)[number]) {
  return (
    <figure className="flex w-72 shrink-0 snap-start flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 sm:w-80">
      <blockquote className="text-md leading-relaxed">
        <p>“{quote}”</p>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-muted-foreground">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsMarquee() {
  const [revealRef, shown] = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  // The row is two identical copies; sliding by half its width loops seamlessly.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced || typeof track.animate !== 'function') return;
    const duration = (track.scrollWidth / 2 / SPEED) * 1000;
    const anim = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], {
      duration,
      iterations: Infinity,
    });
    animation.current = anim;
    return () => {
      anim.cancel();
      animation.current = null;
    };
  }, [reduced]);

  // Hovering pauses so a quote can be read; the button pauses until pressed again.
  useEffect(() => {
    const anim = animation.current;
    if (!anim) return;
    if (paused || hovered) anim.pause();
    else anim.play();
  }, [paused, hovered, reduced]);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background py-14 sm:py-20">
      <div ref={revealRef} className={shown ? 'ui-stagger' : 'motion-safe:opacity-0'}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">Teams sleep better on Halcyon.</h2>
            <p className="mt-4 text-md text-muted-foreground sm:text-lg">
              Rated 4.9 out of 5 by more than 1,200 engineers who are on call this week.
            </p>
          </div>
          {!reduced && (
            <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play' : 'Pause'} testimonials
            </Button>
          )}
        </div>

        {reduced ? (
          // Reduced motion: the same cards in a row people scroll themselves
          <div
            role="region"
            aria-label="Testimonials"
            tabIndex={0}
            className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-14 sm:scroll-px-8 sm:px-8"
          >
            {QUOTES.map((q) => (
              <QuoteCard key={q.name} {...q} />
            ))}
          </div>
        ) : (
          <div
            className="mt-12 overflow-hidden sm:mt-14 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <div ref={trackRef} className="flex w-max">
              <div className="flex gap-4 pr-4">
                {QUOTES.map((q) => (
                  <QuoteCard key={q.name} {...q} />
                ))}
              </div>
              <div className="flex gap-4 pr-4" aria-hidden="true">
                {QUOTES.map((q) => (
                  <QuoteCard key={q.name} {...q} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
