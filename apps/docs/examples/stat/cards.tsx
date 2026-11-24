import { Stat, StatDelta, StatGroup, StatHelp, StatLabel, StatValue } from 'ui-kit';

export default function StatCards() {
  return (
    <StatGroup className="w-full" aria-label="Billing overview">
      <Stat>
        <StatLabel>Outstanding</StatLabel>
        <StatValue>$18,420</StatValue>
        <StatDelta value="$2,100" direction="up" tone="negative" comparison="vs last month" />
        <StatHelp>Across 9 unpaid invoices</StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Collected</StatLabel>
        <StatValue>$64,905</StatValue>
        <StatDelta value="8.2%" direction="up" comparison="vs last month" />
        <StatHelp>Updated 4 minutes ago</StatHelp>
      </Stat>
      <Stat>
        <StatLabel>Refunds</StatLabel>
        <StatValue>$1,260</StatValue>
        <StatDelta value="No change" direction="flat" comparison="vs last month" />
        <StatHelp>3 refunds this month</StatHelp>
      </Stat>
    </StatGroup>
  );
}
