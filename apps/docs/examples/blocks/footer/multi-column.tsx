'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Input, Label } from 'ui-kit';

const COLUMNS = [
  { title: 'Product', links: ['Rollouts', 'Feature flags', 'Incidents', 'On-call', 'Status pages', 'Changelog'] },
  { title: 'Resources', links: ['Documentation', 'API reference', 'Guides', 'Release academy', 'Community'] },
  { title: 'Company', links: ['About', 'Customers', 'Careers', 'Press', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA', 'Cookie settings'] },
];

const SOCIAL = ['GitHub', 'LinkedIn', 'YouTube'];

function Logo() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" aria-hidden="true">
        <path d="M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0" />
        <path d="M4 9c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity={0.55} />
      </svg>
    </span>
  );
}

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

export default function FooterMultiColumn() {
  const [ref, shown] = useReveal<HTMLDivElement>();
  const emailId = useId();
  const [subscribed, setSubscribed] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    // Send it to your mailing list provider here
    setSubscribed(typeof email === 'string' ? email : '');
  };

  return (
    <footer className="rounded-2xl border border-border bg-background px-5 pt-14 pb-8 sm:px-8 sm:pt-16">
      <div ref={ref} className={`mx-auto max-w-6xl ${shown ? 'ui-stagger' : 'motion-safe:opacity-0'}`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-16">
          <div className="min-w-0">
            <a href="#" className="inline-flex items-center gap-2 rounded-md font-display text-md font-semibold tracking-tight">
              <Logo />
              Halcyon
            </a>
            <p className="mt-4 max-w-sm text-md text-muted-foreground">
              Release management and incident response for teams that ship every day.
            </p>

            <form onSubmit={onSubmit} className="mt-8 max-w-sm">
              <Label htmlFor={emailId}>The release notes, monthly</Label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="min-w-0 flex-1"
                />
                <Button type="submit">Subscribe</Button>
              </div>
              <p role="status" className="mt-2 min-h-5 text-sm text-muted-foreground">
                {subscribed !== null ? `Thanks! The next issue goes to ${subscribed || 'your inbox'}.` : 'One email a month. Unsubscribe any time.'}
              </p>
            </form>
          </div>

          <nav aria-label="Footer" className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title} className="min-w-0">
                <h2 className="text-sm font-medium">{col.title}</h2>
                <ul className="mt-4 grid gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>© 2026 Halcyon Labs, Inc.</p>
            <a href="#" className="rounded-full">
              <Badge variant="success" size="sm" live>
                All systems normal
              </Badge>
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {SOCIAL.map((s) => (
              <li key={s}>
                <a href="#" className="transition-colors duration-150 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
