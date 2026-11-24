import { Badge, Button, Icon } from 'ui-kit';

const NAV = ['Product', 'Customers', 'Pricing', 'Docs', 'Changelog'];

/** Bar heights (%) for the deploy-frequency chart inside the product mock. */
const BARS = [38, 52, 44, 61, 57, 70, 48, 66, 74, 59, 81, 72, 88, 79, 93, 86];

const DEPLOYS = [
  { version: 'v4.12.0', service: 'checkout-api', who: 'Amina R.', time: '2m ago', tone: 'bg-success' },
  { version: 'v4.11.3', service: 'search-indexer', who: 'Jonas W.', time: '38m ago', tone: 'bg-success' },
  { version: 'v4.11.2', service: 'billing-worker', who: 'Mei T.', time: '1h ago', tone: 'bg-warning' },
];

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

/** A product screenshot drawn with divs: no image to load, follows the theme. */
function ProductMock() {
  return (
    <div
      role="img"
      aria-label="The Halcyon releases dashboard: deploy frequency chart, uptime and recent deploys"
      className="rounded-t-2xl border border-b-0 border-border bg-muted/60 p-1.5 pb-0 sm:p-2 sm:pb-0"
    >
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto hidden h-6 w-64 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground sm:flex">
            app.halcyon.dev/releases
          </div>
        </div>
        <div className="flex">
          <div className="hidden w-48 shrink-0 flex-col gap-1 border-r border-border p-3 md:flex">
            {[72, 56, 64, 48, 60].map((w, i) => (
              <div key={i} className={i === 1 ? 'flex h-8 items-center gap-2 rounded-md bg-muted px-2' : 'flex h-8 items-center gap-2 px-2'}>
                <span className={i === 1 ? 'size-3.5 rounded bg-foreground/70' : 'size-3.5 rounded bg-border'} />
                <span className={i === 1 ? 'h-2 rounded-full bg-foreground/70' : 'h-2 rounded-full bg-border'} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1 p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-md font-semibold">Releases</p>
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">New release</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {[
                ['Deploys this week', '142'],
                ['Uptime', '99.98%'],
                ['Mean time to recover', '4m 12s'],
              ].map(([label, value], i) => (
                <div key={label} className={i === 2 ? 'hidden rounded-lg border border-border p-3 sm:block' : 'rounded-lg border border-border p-3'}>
                  <p className="truncate text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-border p-3 sm:mt-4">
              <div className="flex h-24 items-end gap-1 sm:h-32 sm:gap-1.5">
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-[3px] bg-series-1"
                    style={{ height: `${h}%`, opacity: i === BARS.length - 1 ? 1 : 0.35 + (i / BARS.length) * 0.5 }}
                  />
                ))}
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border rounded-lg border border-border sm:mt-4">
              {DEPLOYS.map((d) => (
                <li key={d.version} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className={`size-2 shrink-0 rounded-full ${d.tone}`} />
                  <span className="font-mono text-xs">{d.version}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.service}</span>
                  <span className="hidden text-muted-foreground sm:inline">{d.who}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{d.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroCentered() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-background">
      {/* Subtle gradient wash: marketing blocks only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]"
        style={{
          backgroundImage:
            'radial-gradient(55% 50% at 50% 0%, color-mix(in oklch, var(--ui-series-1) 11%, transparent), transparent 72%), radial-gradient(30% 35% at 85% 18%, color-mix(in oklch, var(--ui-series-5) 9%, transparent), transparent 70%)',
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-2 rounded-md font-display text-md font-semibold tracking-tight">
          <Logo />
          Halcyon
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors duration-150 hover:text-foreground">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#">Sign in</a>
          </Button>
          <Button size="sm" asChild>
            <a href="#">Start free</a>
          </Button>
        </div>
      </header>

      <div className="ui-stagger mx-auto flex max-w-3xl flex-col items-center px-5 pt-12 pb-12 text-center sm:px-8 sm:pt-20 sm:pb-16">
        <div className="max-w-full">
          <a
            href="#"
            className="group inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background/80 py-1 pr-3 pl-1 text-sm backdrop-blur transition-colors duration-150 hover:border-input"
          >
            <Badge size="sm">New</Badge>
            <span className="truncate text-muted-foreground">Progressive rollouts are here</span>
            <Icon
              name="arrow-right"
              size={14}
              className="shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </a>
        </div>
        <h1 className="mt-6 font-display text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
          Ship every day. Sleep every night.
        </h1>
        <p className="mt-5 max-w-xl text-md text-muted-foreground sm:text-lg">
          Halcyon puts releases, feature flags and incident response on one calm timeline, so your team moves fast without
          paging anyone at 3am.
        </p>
        <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
          <Button size="lg" asChild>
            <a href="#">
              Start free trial
              <Icon name="arrow-right" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#">Book a demo</a>
          </Button>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">14 days free · No credit card · SOC 2 Type II</p>
      </div>

      <div className="ui-animate-rise mx-auto max-w-5xl px-4 [animation-delay:200ms] sm:px-8">
        <div className="[mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          <ProductMock />
        </div>
      </div>
    </section>
  );
}
