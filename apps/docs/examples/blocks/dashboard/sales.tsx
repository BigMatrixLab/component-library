'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  BarChart,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DonutChart,
  Icon,
  Progress,
  RadialChart,
  SegmentedControl,
  SegmentedControlItem,
  Stat,
  StatDelta,
  StatGroup,
  StatHelp,
  StatLabel,
  StatValue,
  UsageMeter,
} from 'ui-kit';

type Region = 'all' | 'americas' | 'emea' | 'apac';

// Each region's share of the company numbers, and how far it is towards its quota
const REGIONS: Record<Region, { label: string; share: number; attainment: number; winRate: number }> = {
  all: { label: 'All regions', share: 1, attainment: 78, winRate: 31.4 },
  americas: { label: 'Americas', share: 0.47, attainment: 84, winRate: 33.9 },
  emea: { label: 'EMEA', share: 0.33, attainment: 73, winRate: 30.2 },
  apac: { label: 'APAC', share: 0.2, attainment: 69, winRate: 27.8 },
};

const QUOTA = 2_400_000;
const months = [
  { month: 'Jul', newBusiness: 412_000, expansion: 148_000 },
  { month: 'Aug', newBusiness: 386_000, expansion: 171_000 },
  { month: 'Sep', newBusiness: 455_000, expansion: 163_000 },
  { month: 'Oct', newBusiness: 498_000, expansion: 192_000 },
  { month: 'Nov', newBusiness: 531_000, expansion: 214_000 },
  { month: 'Dec', newBusiness: 284_000, expansion: 96_000 },
];
const plans = [
  { plan: 'Enterprise', arr: 6_840_000 },
  { plan: 'Business', arr: 3_920_000 },
  { plan: 'Team', arr: 1_760_000 },
  { plan: 'Starter', arr: 540_000 },
];
const reps: { name: string; initials: string; region: Exclude<Region, 'all'>; closed: number; quota: number }[] = [
  { name: 'Amina Rahman', initials: 'AR', region: 'emea', closed: 312_000, quota: 340_000 },
  { name: 'Diego Santos', initials: 'DS', region: 'americas', closed: 298_000, quota: 320_000 },
  { name: 'Grace Liu', initials: 'GL', region: 'apac', closed: 214_000, quota: 280_000 },
  { name: 'Marcus Bell', initials: 'MB', region: 'americas', closed: 256_000, quota: 320_000 },
  { name: 'Lena Vogel', initials: 'LV', region: 'emea', closed: 188_000, quota: 300_000 },
  { name: 'Kenji Mori', initials: 'KM', region: 'apac', closed: 141_000, quota: 240_000 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export default function DashboardSales() {
  const [region, setRegion] = useState<Region>('all');
  const r = REGIONS[region];
  const scale = (n: number) => Math.round(n * r.share);

  const quota = scale(QUOTA);
  const closed = Math.round((quota * r.attainment) / 100);
  const commit = Math.round(quota * 0.12);
  const bestCase = Math.round(quota * 0.09);
  const pipeline = scale(5_860_000);
  const deals = Math.max(1, scale(214));
  const team = region === 'all' ? reps : reps.filter((rep) => rep.region === region);

  return (
    <div className="@container w-full">
      <div className="grid gap-4 @2xl:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Sales</h2>
            <p className="text-sm text-muted-foreground">Q4 2026 · 37 days left in the quarter</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl size="sm" value={region} onValueChange={(v) => setRegion(v as Region)} aria-label="Region">
              <SegmentedControlItem value="all">All</SegmentedControlItem>
              <SegmentedControlItem value="americas">Americas</SegmentedControlItem>
              <SegmentedControlItem value="emea">EMEA</SegmentedControlItem>
              <SegmentedControlItem value="apac">APAC</SegmentedControlItem>
            </SegmentedControl>
            <Button size="sm">
              <Icon name="plus" />
              New deal
            </Button>
          </div>
        </div>

        <StatGroup aria-label={`Quarter to date, ${r.label}`}>
          <Stat>
            <StatLabel>Closed won</StatLabel>
            <StatValue>{money.format(closed)}</StatValue>
            <StatDelta value="18.2%" direction="up" comparison="vs Q3" />
            <StatHelp>{deals} deals this quarter</StatHelp>
          </Stat>
          <Stat>
            <StatLabel>Open pipeline</StatLabel>
            <StatValue>{compactMoney.format(pipeline)}</StatValue>
            <StatDelta value="6.5%" direction="up" comparison="vs Q3" />
            <StatHelp>2.4× the remaining quota</StatHelp>
          </Stat>
          <Stat>
            <StatLabel>Win rate</StatLabel>
            <StatValue>{r.winRate.toFixed(1)}%</StatValue>
            <StatDelta value="1.2 pts" direction="down" comparison="vs Q3" />
            <StatHelp>Deals closed won of all closed</StatHelp>
          </Stat>
          <Stat>
            <StatLabel>Sales cycle</StatLabel>
            <StatValue>34 days</StatValue>
            <StatDelta value="4 days" direction="down" tone="positive" comparison="vs Q3" />
            <StatHelp>Median, first call to signature</StatHelp>
          </Stat>
        </StatGroup>

        <div className="grid gap-4 @2xl:gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Quota attainment</CardTitle>
              <CardDescription>{r.label}, quarter to date</CardDescription>
            </CardHeader>
            <CardContent>
              <RadialChart
                variant="semicircle"
                data={[{ name: 'Attainment', value: r.attainment }]}
                index="name"
                valueKey="value"
                max={100}
                valueFormat="percent"
                centerLabel={`of ${compactMoney.format(quota)} quota`}
                legend={false}
                height={170}
              />
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
                {[
                  ['Closed', closed],
                  ['Commit', commit],
                  ['Best case', bestCase],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{compactMoney.format(value as number)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>ARR by plan</CardTitle>
              <CardDescription>Annual recurring revenue, {r.label.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={plans.map((p) => ({ plan: p.plan, arr: scale(p.arr) }))}
                index="plan"
                valueKey="arr"
                centerLabel="Total ARR"
                valueFormat={{ style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }}
                height={240}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0 @2xl:col-span-2 @5xl:col-span-1">
            <CardHeader>
              <CardTitle>Plan usage</CardTitle>
              <CardDescription>Workspace limits on the Scale plan</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <UsageMeter
                label="API requests"
                value={8_620_000}
                max={10_000_000}
                formatValue={(n) => compactMoney.format(n).replace('$', '')}
                description="Resets on 1 December"
              />
              <UsageMeter label="Seats" value={46} max={50} summary="46 of 50 seats" />
              <UsageMeter label="Storage" value={412} max={1000} unit="GB" />
              <UsageMeter label="Build minutes" value={3120} max={6000} formatValue={(n) => n.toLocaleString('en-US')} />
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">
                Manage plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 @2xl:gap-6 @4xl:grid-cols-5">
          <Card className="min-w-0 @4xl:col-span-3">
            <CardHeader>
              <CardTitle>Bookings by month</CardTitle>
              <CardDescription>New business and expansion, last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={months.map((m) => ({ month: m.month, newBusiness: scale(m.newBusiness), expansion: scale(m.expansion) }))}
                index="month"
                series={[
                  { key: 'newBusiness', label: 'New business', color: 'series-1' },
                  { key: 'expansion', label: 'Expansion', color: 'series-2' },
                ]}
                stacked
                valueFormat="currency"
                height={260}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0 @4xl:col-span-2">
            <CardHeader>
              <CardTitle>Top reps</CardTitle>
              <CardDescription>Closed won against personal quota</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4" aria-label="Top reps">
                {team.map((rep) => {
                  const pct = Math.round((rep.closed / rep.quota) * 100);
                  return (
                    <li key={rep.name} className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{rep.initials}</AvatarFallback>
                      </Avatar>
                      <div className="grid min-w-0 flex-1 gap-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="truncate font-medium">{rep.name}</span>
                          <span className="flex-none tabular-nums text-muted-foreground">
                            {compactMoney.format(rep.closed)} · {pct}%
                          </span>
                        </div>
                        <Progress
                          value={pct}
                          size="sm"
                          tone={pct >= 90 ? 'success' : 'default'}
                          aria-label={`${rep.name}, ${pct}% of quota`}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
