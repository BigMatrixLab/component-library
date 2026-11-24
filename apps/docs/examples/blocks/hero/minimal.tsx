import { Button, CopyButton, Icon } from 'ui-kit';

const INSTALL = 'npm install -g @halcyon/cli';

const CUSTOMERS = ['Parallax', 'Quanta', 'Foundry', 'Meridian', 'Copperleaf', 'Northbeam'];

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

export default function HeroMinimal() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-2 rounded-md font-display text-md font-semibold tracking-tight">
          <Logo />
          Halcyon
        </a>
        <a href="#" className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground">
          Read the docs
        </a>
      </header>

      <div className="ui-stagger mx-auto max-w-5xl px-5 pt-14 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
        <p className="font-mono text-sm text-muted-foreground">Halcyon CLI 3.0</p>
        <h1 className="mt-4 max-w-3xl font-display text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
          Release from your terminal.
          <span className="block text-muted-foreground">Roll back before anyone notices.</span>
        </h1>
        <p className="mt-6 max-w-xl text-md text-muted-foreground sm:text-lg">
          One command ships to every region with health checks between each step. If error rates climb, Halcyon
          stops the rollout and restores the last good version on its own.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-border bg-card pr-1.5 pl-3.5">
            <span className="font-mono text-sm text-muted-foreground select-none" aria-hidden="true">
              $
            </span>
            <code className="min-w-0 flex-1 truncate font-mono text-sm">{INSTALL}</code>
            <CopyButton value={INSTALL} aria-label="Copy install command" />
          </div>
          <Button size="lg" variant="ghost" asChild>
            <a href="#">
              Quickstart guide
              <Icon name="arrow-right" />
            </a>
          </Button>
        </div>

        <div className="mt-16 border-t border-border pt-6 sm:mt-20">
          <p className="text-sm text-muted-foreground">Releasing 30,000 times a week at</p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {CUSTOMERS.map((name) => (
              <li key={name} className="font-display text-lg font-semibold tracking-tight text-muted-foreground">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
