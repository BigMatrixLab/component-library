'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Badge,
  BarChart,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Icon,
  SegmentedControl,
  SegmentedControlItem,
  Sparkline,
  Stat,
  StatChart,
  StatDelta,
  StatGroup,
  StatLabel,
  StatValue,
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  type DataTableColumn,
} from 'ui-kit';

type Range = '7d' | '30d' | '90d';
const DAYS: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 };

// 180 days ending 24 Nov 2026: enough for the longest range and the period before it.
// Deterministic (no Math.random), so the server and the browser render the same numbers.
const daily = Array.from({ length: 180 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 10, 24 - 179 + i));
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const wave = 1 + Math.sin(i / 6) * 0.08 + Math.sin(i / 17) * 0.05;
  const visitors = Math.round((2100 + i * 9) * wave * (weekend ? 0.74 : 1));
  const orders = Math.round(visitors * (0.026 + Math.cos(i / 11) * 0.002));
  return { date: date.toISOString().slice(0, 10), visitors, orders, revenue: Math.round(orders * (84 + (i % 9))) };
});

type Day = (typeof daily)[number];
type Metric = 'revenue' | 'orders' | 'visitors';

const sum = (rows: Day[], key: Metric) => rows.reduce((total, row) => total + row[key], 0);
const change = (now: number, before: number) => ((now - before) / before) * 100;

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const count = new Intl.NumberFormat('en-US');
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const day = (v: string | number) => shortDate.format(new Date(`${v}T00:00:00Z`));

const channels = [
  { channel: 'Organic search', share: 0.36 },
  { channel: 'Direct', share: 0.24 },
  { channel: 'Email', share: 0.17 },
  { channel: 'Paid social', share: 0.14 },
  { channel: 'Referral', share: 0.09 },
];

type OrderStatus = 'paid' | 'processing' | 'shipped' | 'refunded';
interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: OrderStatus;
  date: string;
  total: number;
}

const people = ['Amara Okafor', 'Liam Brennan', 'Sofia Marchetti', 'Noah Fischer', 'Yuki Tanaka', 'Priya Raman', 'Mateo Alvarez', 'Elena Petrova', 'Jonas Lindqvist', 'Hana Kim'];
const products = ['Linen throw', 'Oak side table', 'Ceramic vase set', 'Wool rug 160 × 230', 'Pendant lamp', 'Walnut wall shelf'];
const statuses: OrderStatus[] = ['paid', 'shipped', 'processing', 'paid', 'shipped', 'refunded', 'paid', 'processing'];

const orders: Order[] = Array.from({ length: 24 }, (_, i) => {
  const customer = people[(i * 3) % people.length];
  return {
    id: `#${4821 - i}`,
    customer,
    email: `${customer.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    product: products[(i * 5) % products.length],
    status: statuses[i % statuses.length],
    date: new Date(Date.UTC(2026, 10, 24 - Math.floor(i / 3))).toISOString().slice(0, 10),
    total: 48 + ((i * 7919) % 46000) / 100,
  };
});

const tone = { paid: 'success', shipped: 'info', processing: 'warning', refunded: 'secondary' } as const;
const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);

const columns: DataTableColumn<Order>[] = [
  {
    id: 'customer',
    header: 'Customer',
    accessor: 'customer',
    sortable: true,
    searchText: (row) => `${row.id} ${row.customer} ${row.email} ${row.product}`,
    cell: ({ row }) => (
      <div className="grid leading-tight">
        <span className="font-medium">{row.customer}</span>
        <span className="text-xs text-muted-foreground">
          {row.id} · {row.product}
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: ({ row }) => (
      <Badge variant={tone[row.status]} dot>
        {capitalise(row.status)}
      </Badge>
    ),
  },
  { id: 'date', header: 'Date', accessor: 'date', sortable: true, cell: ({ row }) => day(row.date) },
  {
    id: 'total',
    header: 'Total',
    accessor: 'total',
    sortable: true,
    align: 'right',
    cell: ({ row }) => <span className="tabular-nums">{cents.format(row.total)}</span>,
  },
];

const activity = [
  { tone: 'success', icon: 'circle-check', title: 'Payout of $12,480 sent', time: '2026-11-24T14:10', at: '2:10 pm', text: 'Deposited to the account ending 4410.' },
  { tone: 'warning', icon: 'triangle-alert', title: 'Low stock: Pendant lamp', time: '2026-11-24T11:42', at: '11:42 am', text: '6 left. At the current rate it sells out in 3 days.' },
  { tone: 'info', icon: 'mail', title: 'Black Friday email sent', time: '2026-11-24T09:00', at: '9:00 am', text: '18,240 recipients, 41% opened so far.' },
  { tone: 'destructive', icon: 'circle-x', title: 'Refund issued for #4816', time: '2026-11-23T16:25', at: 'Yesterday', text: 'Damaged in transit. Replacement shipped.' },
  { tone: 'default', icon: 'users', title: 'Tomás Herrera joined the team', time: '2026-11-23T10:05', at: 'Yesterday', text: 'Role: Support, with access to orders.' },
] as const;

function Kpi({
  label,
  value,
  delta,
  goodWhenDown,
  series,
  color,
  variant = 'area',
}: {
  label: string;
  value: string;
  delta: number;
  goodWhenDown?: boolean;
  series: number[];
  color: string;
  variant?: 'area' | 'line' | 'bar';
}) {
  const up = delta >= 0;
  return (
    <Stat>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
      <StatDelta
        value={`${Math.abs(delta).toFixed(1)}%`}
        direction={up ? 'up' : 'down'}
        tone={up !== Boolean(goodWhenDown) ? 'positive' : 'negative'}
        comparison="vs previous period"
      />
      <StatChart>
        <Sparkline data={series} variant={variant} height={32} color={color} aria-label={`${label}, daily`} />
      </StatChart>
    </Stat>
  );
}

export default function DashboardAnalytics() {
  const [range, setRange] = useState<Range>('30d');

  const view = useMemo(() => {
    const n = DAYS[range];
    const now = daily.slice(-n);
    const before = daily.slice(-2 * n, -n);
    const revenue = sum(now, 'revenue');
    const orderCount = sum(now, 'orders');
    const visitors = sum(now, 'visitors');
    const conversion = (orderCount / visitors) * 100;
    const conversionBefore = (sum(before, 'orders') / sum(before, 'visitors')) * 100;
    return {
      revenue,
      orderCount,
      visitors,
      conversion,
      deltas: {
        revenue: change(revenue, sum(before, 'revenue')),
        orders: change(orderCount, sum(before, 'orders')),
        visitors: change(visitors, sum(before, 'visitors')),
        conversion: change(conversion, conversionBefore),
      },
      trend: now.map((row, i) => ({ date: row.date, current: row.revenue, previous: before[i].revenue })),
      spark: {
        revenue: now.map((r) => r.revenue),
        orders: now.map((r) => r.orders),
        visitors: now.map((r) => r.visitors),
        conversion: now.map((r) => (r.orders / r.visitors) * 100),
      },
      channels: channels.map((c) => ({ channel: c.channel, revenue: Math.round(revenue * c.share) })),
    };
  }, [range]);

  const label = range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days';

  return (
    <div className="@container w-full">
      <div className="grid gap-4 @2xl:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground">Northwind Home store · {label}, up to 24 Nov 2026</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl size="sm" value={range} onValueChange={(v) => setRange(v as Range)} aria-label="Date range">
              <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
              <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
              <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
            </SegmentedControl>
            <Button size="sm" variant="outline">
              <Icon name="download" />
              Export
            </Button>
          </div>
        </div>

        <StatGroup variant="shared" aria-label="Key metrics">
          <Kpi label="Revenue" value={money.format(view.revenue)} delta={view.deltas.revenue} series={view.spark.revenue} color="series-1" />
          <Kpi label="Orders" value={count.format(view.orderCount)} delta={view.deltas.orders} series={view.spark.orders} color="series-2" variant="bar" />
          <Kpi label="Visitors" value={count.format(view.visitors)} delta={view.deltas.visitors} series={view.spark.visitors} color="series-3" variant="line" />
          <Kpi
            label="Conversion rate"
            value={`${view.conversion.toFixed(2)}%`}
            delta={view.deltas.conversion}
            series={view.spark.conversion}
            color="series-4"
            variant="line"
          />
        </StatGroup>

        <div className="grid gap-4 @2xl:gap-6 @4xl:grid-cols-3">
          <Card className="min-w-0 @4xl:col-span-2">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Daily revenue against the previous {DAYS[range]} days</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={view.trend}
                index="date"
                series={[
                  { key: 'current', label: 'This period', color: 'series-1' },
                  { key: 'previous', label: 'Previous period', color: 'var(--ui-muted-foreground)' },
                ]}
                indexFormat={day}
                valueFormat="currency"
                height={260}
              />
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Revenue by channel</CardTitle>
              <CardDescription>Where this period’s orders came from</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={view.channels}
                index="channel"
                orientation="horizontal"
                series={[{ key: 'revenue', label: 'Revenue', color: 'series-1' }]}
                valueFormat="currency"
                legend={false}
                height={260}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 @2xl:gap-6 @4xl:grid-cols-5">
          <Card className="min-w-0 @4xl:col-span-3">
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>{orders.length} orders in the last 8 days</CardDescription>
              <CardAction>
                <Button size="sm" variant="ghost">
                  View all
                  <Icon name="arrow-right" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={orders}
                label="Recent orders"
                rowLabel="order"
                searchPlaceholder="Search orders"
                columnsMenu={false}
                defaultPageSize={5}
                pageSizeOptions={[5, 10]}
                defaultSort={{ id: 'date', direction: 'desc' }}
                compact
              />
            </CardContent>
          </Card>
          <Card className="min-w-0 @4xl:col-span-2">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>What happened in the store</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline aria-label="Store activity">
                {activity.map((a) => (
                  <TimelineItem key={a.title} tone={a.tone} marker={<Icon name={a.icon} />}>
                    <TimelineHeader>
                      <TimelineTitle>{a.title}</TimelineTitle>
                      <TimelineTime dateTime={a.time}>{a.at}</TimelineTime>
                    </TimelineHeader>
                    <TimelineDescription>{a.text}</TimelineDescription>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
