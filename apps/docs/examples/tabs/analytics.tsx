import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-kit';

const periods = [
  { value: 'day', label: 'Day', visitors: '2,841', change: '+4.2%', note: 'vs. yesterday' },
  { value: 'week', label: 'Week', visitors: '19,306', change: '+11.8%', note: 'vs. last week' },
  { value: 'month', label: 'Month', visitors: '84,120', change: '+7.5%', note: 'vs. last month' },
  { value: 'year', label: 'Year', visitors: '1.02M', change: '+32.1%', note: 'vs. last year' },
];

export default function TabsAnalytics() {
  return (
    <Tabs defaultValue="week" variant="underline" className="w-full max-w-md">
      <TabsList aria-label="Reporting period">
        {periods.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {periods.map((p) => (
        <TabsContent key={p.value} value={p.value}>
          <p className="text-sm text-muted-foreground">Unique visitors</p>
          <p className="text-4xl font-semibold tabular-nums tracking-tight">{p.visitors}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-success-text">{p.change}</span> {p.note}
          </p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
