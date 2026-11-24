'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field, FieldError, Icon, Input, InputGroup, InputIcon, type IconName } from 'ui-kit';

const PAGES: { title: string; description: string; href: string; icon: IconName }[] = [
  { title: 'Dashboard', description: 'Cash, runway and this month’s spend', href: '#dashboard', icon: 'layout-dashboard' },
  { title: 'Invoices', description: 'Send, track and reconcile invoices', href: '#invoices', icon: 'file' },
  { title: 'Reports', description: 'P&L, balance sheet and cash flow', href: '#reports', icon: 'bar-chart' },
  { title: 'Help centre', description: 'Guides, how-tos and troubleshooting', href: '#help', icon: 'info' },
  { title: 'Team settings', description: 'Members, roles and permissions', href: '#settings', icon: 'users' },
  { title: 'System status', description: 'Live uptime for every Lumen service', href: '#status', icon: 'activity' },
];

/** A calm illustration from plain shapes: a page that drifted out of its orbit, and a magnifier. */
function LostPage() {
  return (
    <svg viewBox="0 0 240 168" className="w-52 @md:w-60" aria-hidden="true">
      <circle cx="120" cy="88" r="70" className="fill-muted" />
      <circle cx="120" cy="88" r="80" fill="none" strokeDasharray="3 7" strokeLinecap="round" className="stroke-border" strokeWidth="1.5" />
      <g transform="rotate(-8 108 84)">
        <rect x="76" y="40" width="64" height="84" rx="8" strokeWidth="1.5" className="fill-card stroke-border" />
        <rect x="88" y="56" width="32" height="6" rx="3" className="fill-muted-foreground/40" />
        <rect x="88" y="70" width="40" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="88" y="80" width="36" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="88" y="90" width="40" height="4" rx="2" className="fill-muted-foreground/20" />
        <rect x="88" y="100" width="24" height="4" rx="2" className="fill-muted-foreground/20" />
      </g>
      <circle cx="156" cy="104" r="20" strokeWidth="5" className="fill-background stroke-primary" />
      <path d="M170 119 186 135" strokeWidth="7" strokeLinecap="round" className="stroke-primary" />
      <path d="M150 99a6 6 0 1 1 8 5.6c-1.3.5-2 1.6-2 3V109" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-primary" />
      <circle cx="156" cy="114.5" r="1.8" className="fill-primary" />
      <circle cx="58" cy="44" r="3" className="fill-primary/40" />
      <circle cx="196" cy="58" r="2" className="fill-muted-foreground/30" />
    </svg>
  );
}

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setError('Type what you were looking for.');
      (e.currentTarget.elements.namedItem('q') as HTMLInputElement).focus();
      return;
    }
    setSubmitted(q);
  };

  const term = submitted?.toLowerCase();
  const results = term ? PAGES.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(term)) : PAGES;

  return (
    <div className="@container w-full rounded-xl border border-border bg-background px-5 py-12 @2xl:py-16">
      <div className="mx-auto grid max-w-xl justify-items-center gap-6 text-center">
        <LostPage />
        <div className="grid gap-3">
          <p className="font-mono text-sm font-medium text-primary-text">404 · Page not found</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight @2xl:text-4xl">We can’t find that page</h1>
          <p className="text-md text-muted-foreground">
            Nothing lives at <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">/reports/q3-summary</span>. The
            link may be old, or the page may have moved. Try a search, or head back home.
          </p>
        </div>

        <form role="search" noValidate onSubmit={search} className="w-full max-w-md text-left">
          <Field invalid={!!error}>
            <div className="flex gap-2">
              <InputGroup className="flex-1">
                <InputIcon>
                  <Icon name="search" />
                </InputIcon>
                <Input
                  name="q"
                  type="search"
                  aria-label="Search Lumen"
                  placeholder="Search pages and help articles"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (error) setError(undefined);
                  }}
                />
              </InputGroup>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
            <FieldError>{error}</FieldError>
          </Field>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <a href="#home">
              <Icon name="home" />
              Back to home
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@lumen.dev">Contact support</a>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-3">
        <h2 className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {submitted ? (results.length ? `Results for “${submitted}”` : `No pages match “${submitted}”. Try a broader word, or pick one of these.`) : 'Popular pages'}
        </h2>
        <ul className="grid gap-2 @xl:grid-cols-2">
          {(results.length ? results : PAGES).map((p) => (
            <li key={p.href}>
              <a
                href={p.href}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors duration-150 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/45"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
                  <Icon name={p.icon} />
                </span>
                <span className="grid min-w-0 flex-1 text-sm">
                  <span className="font-medium">{p.title}</span>
                  <span className="truncate text-muted-foreground">{p.description}</span>
                </span>
                <Icon name="chevron-right" className="text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
