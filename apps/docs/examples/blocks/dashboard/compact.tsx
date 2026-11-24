import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Progress,
  RadialChart,
  Sparkline,
  type IconName,
} from 'ui-kit';

// No state and no function props: this block renders as a Server Component in Next.js.

const kpis: {
  label: string;
  icon: IconName;
  value: string;
  delta: string;
  good: boolean;
  note: string;
  series: number[];
  color: string;
}[] = [
  {
    label: 'Requests',
    icon: 'activity',
    value: '18.4M',
    delta: '+12.1%',
    good: true,
    note: 'last 24 hours',
    series: [11, 12, 12.6, 12.2, 13.8, 14.1, 13.6, 15.2, 15.9, 16.4, 17.1, 18.4],
    color: 'series-1',
  },
  {
    label: 'p95 latency',
    icon: 'clock',
    value: '182 ms',
    delta: '−9 ms',
    good: true,
    note: 'vs yesterday',
    series: [214, 205, 209, 198, 201, 193, 196, 188, 190, 184, 186, 182],
    color: 'series-2',
  },
  {
    label: 'Error rate',
    icon: 'triangle-alert',
    value: '0.21%',
    delta: '+0.04 pts',
    good: false,
    note: 'vs yesterday',
    series: [0.14, 0.16, 0.15, 0.17, 0.15, 0.18, 0.2, 0.17, 0.19, 0.22, 0.2, 0.21],
    color: 'series-4',
  },
  {
    label: 'Active users',
    icon: 'users',
    value: '9,312',
    delta: '+3.4%',
    good: true,
    note: 'right now',
    series: [7.8, 8.1, 8.4, 8.2, 8.6, 8.9, 8.7, 9.0, 9.1, 9.0, 9.2, 9.3],
    color: 'series-3',
  },
];

const endpoints = [
  { path: 'GET /v1/orders', requests: 4_812_000 },
  { path: 'POST /v1/checkout', requests: 2_904_000 },
  { path: 'GET /v1/products', requests: 2_361_000 },
  { path: 'GET /v1/search', requests: 1_478_000 },
  { path: 'POST /v1/webhooks', requests: 906_000 },
];
const busiest = endpoints[0].requests;
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const deploys: { message: string; ref: string; status: 'Ready' | 'Building' | 'Failed'; time: string; at: string }[] = [
  { message: 'Cache product search results', ref: 'main · 9c1e4a2', status: 'Building', time: '2026-11-24T14:52', at: '2 min ago' },
  { message: 'Fix tax rounding on refunds', ref: 'main · a3f9c21', status: 'Ready', time: '2026-11-24T14:32', at: '22 min ago' },
  { message: 'Bump image CDN timeout', ref: 'hotfix/cdn · 41d07be', status: 'Failed', time: '2026-11-24T13:05', at: '1 h ago' },
  { message: 'Add Apple Pay to checkout', ref: 'main · 7be2d90', status: 'Ready', time: '2026-11-24T10:18', at: '4 h ago' },
];
const deployTone = { Ready: 'success', Building: 'warning', Failed: 'destructive' } as const;

export default function DashboardCompact() {
  return (
    <div className="@container w-full">
      <div className="grid gap-3 @2xl:gap-4">
        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @2xl:gap-4 @4xl:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="min-w-0 gap-2 [--ui-card-padding:1rem]">
              <CardHeader>
                <CardTitle as="h3" className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
                <CardAction>
                  <Icon name={k.icon} className="text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">{k.value}</span>
                  <span className={k.good ? 'text-xs font-medium text-success-text' : 'text-xs font-medium text-destructive-text'}>
                    {k.delta}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{k.note}</p>
                <div className="mt-3">
                  <Sparkline data={k.series} variant="area" height={36} color={k.color} aria-label={`${k.label}, last 12 hours`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2 @2xl:gap-4 @5xl:grid-cols-3">
          <Card className="min-w-0 gap-3 [--ui-card-padding:1rem]">
            <CardHeader>
              <CardTitle as="h3" className="text-sm">
                Error budget
              </CardTitle>
              <CardDescription className="text-xs">99.9% availability SLO, 30-day window</CardDescription>
            </CardHeader>
            <CardContent>
              <RadialChart
                data={[{ name: 'Budget remaining', value: 64 }]}
                index="name"
                valueKey="value"
                max={100}
                valueFormat="percent"
                centerLabel="remaining"
                legend={false}
                height={168}
              />
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Downtime used</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums">15 min 33 s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Burn rate</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums">0.8× · on track</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-3 [--ui-card-padding:1rem]">
            <CardHeader>
              <CardTitle as="h3" className="text-sm">
                Busiest endpoints
              </CardTitle>
              <CardDescription className="text-xs">Requests in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3" aria-label="Busiest endpoints">
                {endpoints.map((e) => (
                  <li key={e.path} className="grid gap-1.5">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <code className="truncate font-mono text-xs">{e.path}</code>
                      <span className="flex-none tabular-nums text-muted-foreground">{compact.format(e.requests)}</span>
                    </div>
                    <Progress
                      value={Math.round((e.requests / busiest) * 100)}
                      size="sm"
                      aria-label={`${e.path}: ${compact.format(e.requests)} requests`}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-3 [--ui-card-padding:1rem] @2xl:col-span-2 @5xl:col-span-1">
            <CardHeader>
              <CardTitle as="h3" className="text-sm">
                Latest deploys
              </CardTitle>
              <CardDescription className="text-xs">Production, newest first</CardDescription>
              <CardAction>
                <Badge variant="outline" size="sm">
                  <Icon name="globe" />
                  lumen.app
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border" aria-label="Latest deploys">
                {deploys.map((d) => (
                  <li key={d.ref} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.message}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{d.ref}</p>
                    </div>
                    <div className="grid flex-none justify-items-end gap-1">
                      <Badge variant={deployTone[d.status]} size="sm" dot>
                        {d.status}
                      </Badge>
                      <time dateTime={d.time} className="text-xs text-muted-foreground">
                        {d.at}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
