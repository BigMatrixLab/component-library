const LINKS = ['Pricing', 'Docs', 'Changelog', 'Status', 'Privacy', 'Terms'];

function Logo() {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
        <path d="M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0" />
        <path d="M4 9c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity={0.55} />
      </svg>
    </span>
  );
}

/** A one-row footer for product sites, docs and app marketing pages. Zero JS: a Server Component. */
export default function FooterMinimal() {
  return (
    <footer className="rounded-2xl border border-border bg-background px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href="#" className="inline-flex items-center gap-2 rounded-md font-display text-md font-semibold tracking-tight">
            <Logo />
            Halcyon
          </a>
          <p className="text-sm text-muted-foreground">© 2026 Halcyon Labs, Inc.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="transition-colors duration-150 hover:text-foreground">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
