import { Sparkline, Stat, StatChart, StatDelta, StatGroup, StatLabel, StatValue } from 'ui-kit';

const revenue = [18, 22, 21, 26, 25, 31, 29, 35, 38, 36, 42, 47];
const subscribers = [310, 322, 318, 340, 351, 349, 372, 380, 395, 401, 418, 436];
const churn = [3.1, 3.4, 3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.7, 2.4, 2.3];
const latency = [212, 198, 205, 190, 201, 188, 176, 182, 170, 168, 160, 154];

export default function StatKpis() {
  return (
    <StatGroup variant="shared" className="w-full" aria-label="Key metrics">
      <Stat>
        <StatLabel>Monthly revenue</StatLabel>
        <StatValue>$47,210</StatValue>
        <StatDelta value="12.4%" direction="up" comparison="vs last month" />
        <StatChart>
          <Sparkline data={revenue} variant="area" height={32} color="series-1" aria-label="Revenue, last 12 months" />
        </StatChart>
      </Stat>
      <Stat>
        <StatLabel>Active subscribers</StatLabel>
        <StatValue>4,360</StatValue>
        <StatDelta value="4.1%" direction="up" comparison="vs last month" />
        <StatChart>
          <Sparkline data={subscribers} height={32} color="series-2" aria-label="Subscribers, last 12 months" />
        </StatChart>
      </Stat>
      <Stat>
        <StatLabel>Churn rate</StatLabel>
        <StatValue>2.3%</StatValue>
        <StatDelta value="0.4 pts" direction="down" tone="positive" comparison="vs last month" />
        <StatChart>
          <Sparkline data={churn} height={32} color="series-3" aria-label="Churn, last 12 months" />
        </StatChart>
      </Stat>
      <Stat>
        <StatLabel>p95 latency</StatLabel>
        <StatValue>154 ms</StatValue>
        <StatDelta value="9.5%" direction="down" tone="positive" comparison="vs last month" />
        <StatChart>
          <Sparkline data={latency} variant="bar" height={32} color="series-4" aria-label="Latency, last 12 months" />
        </StatChart>
      </Stat>
    </StatGroup>
  );
}
