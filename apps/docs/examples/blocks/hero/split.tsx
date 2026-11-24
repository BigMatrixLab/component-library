import { Avatar, AvatarFallback, AvatarGroup, Badge, Button, Icon } from 'ui-kit';

const NAV = ['Product', 'Solutions', 'Pricing', 'Docs'];

const RESPONDERS = ['AR', 'JW', 'MT', 'CD'];

const EVENTS = [
  { time: '14:02', text: 'Latency on checkout-api above 900ms', tone: 'bg-destructive' },
  { time: '14:03', text: 'Amina Rahman acknowledged and opened #inc-2481', tone: 'bg-warning' },
  { time: '14:05', text: 'Linked to deploy v4.12.1 (12 min earlier)', tone: 'bg-info' },
  { time: '14:06', text: 'Rolled back to v4.12.0, p95 back to 210ms', tone: 'bg-success' },
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

/** The visual: an incident room drawn with divs, plus a floating "resolved" card. */
function IncidentVisual() {
  return (
    <div role="img" aria-label="An incident in Halcyon, resolved four minutes after the alert by rolling back a deploy" className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] sm:-inset-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 60% at 70% 30%, color-mix(in oklch, var(--ui-series-1) 14%, transparent), transparent 70%), radial-gradient(50% 50% at 20% 80%, color-mix(in oklch, var(--ui-series-2) 11%, transparent), transparent 70%)',
        }}
      />
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="destructive" size="sm">
            SEV-2
          </Badge>
          <p className="min-w-0 flex-1 truncate text-md font-semibold">Checkout latency spike</p>
          <span className="text-xs text-muted-foreground tabular-nums">4m 18s</span>
        </div>
        <div className="mt-3 flex items-center gap-3 border-b border-border pb-4">
          <AvatarGroup size="xs">
            {RESPONDERS.map((r) => (
              <Avatar key={r}>
                <AvatarFallback>{r}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <span className="text-sm text-muted-foreground">4 responders</span>
        </div>
        <ol className="mt-4 grid gap-3.5">
          {EVENTS.map((e) => (
            <li key={e.time} className="flex gap-3 text-sm">
              <span className="w-10 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{e.time}</span>
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${e.tone}`} />
              <span className="min-w-0">{e.text}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:absolute sm:-bottom-6 sm:-left-4 sm:mt-0 sm:w-64 sm:shadow-md lg:-left-8">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success text-success-foreground">
          <Icon name="check" size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">Resolved</p>
          <p className="truncate text-xs text-muted-foreground">Rollback finished in 38s</p>
        </div>
      </div>
    </div>
  );
}

export default function HeroSplit() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-background">
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
        <Button variant="outline" size="sm" asChild>
          <a href="#">Sign in</a>
        </Button>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-14 sm:px-8 sm:pt-16 sm:pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="ui-stagger min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-primary-text">
            <Icon name="zap" />
            Incident response
          </p>
          <h1 className="mt-4 font-display text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            From alert to all-clear in minutes, not meetings.
          </h1>
          <p className="mt-5 max-w-lg text-md text-muted-foreground sm:text-lg">
            Halcyon opens the incident room, pulls in the right people and links the deploy that caused it, so
            on-call engineers fix the problem instead of hunting for context.
          </p>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#">Start free trial</a>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="#">
                See how it works
                <Icon name="arrow-right" />
              </a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6">
            <div className="flex items-center gap-0.5 text-warning" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="star" size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">4.9 out of 5</span> from 1,200 on-call engineers
            </p>
          </div>
        </div>

        <div className="ui-animate-rise min-w-0 [animation-delay:160ms] lg:pl-6">
          <IncidentVisual />
        </div>
      </div>
    </section>
  );
}
