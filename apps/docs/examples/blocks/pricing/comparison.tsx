import { Badge, Button, Icon, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from 'ui-kit';

type Value = boolean | string;

const PLANS = [
  { id: 'starter', name: 'Starter', price: 'Free', cta: 'Start free' },
  { id: 'pro', name: 'Pro', price: '$24 / seat', cta: 'Start trial', popular: true },
  { id: 'business', name: 'Business', price: '$49 / seat', cta: 'Talk to sales' },
];

const GROUPS: { title: string; rows: [feature: string, starter: Value, pro: Value, business: Value][] }[] = [
  {
    title: 'Usage',
    rows: [
      ['Seats', 'Up to 3', 'Unlimited', 'Unlimited'],
      ['Bank connections', '1', 'Unlimited', 'Unlimited'],
      ['Entities', '1', '1', 'Up to 25'],
      ['Transaction history', '12 months', '7 years', 'Unlimited'],
    ],
  },
  {
    title: 'Features',
    rows: [
      ['Invoices and expenses', true, true, true],
      ['Approval workflows', false, true, true],
      ['Cash-flow forecast', false, true, true],
      ['Multi-currency', false, false, true],
      ['API access', false, 'Read only', 'Read and write'],
    ],
  },
  {
    title: 'Security',
    rows: [
      ['Two-factor authentication', true, true, true],
      ['SAML single sign-on', false, false, true],
      ['Audit log', false, '30 days', 'Unlimited'],
    ],
  },
  {
    title: 'Support',
    rows: [
      ['Help centre and email', true, true, true],
      ['Priority chat', false, true, true],
      ['Named account manager', false, false, true],
      ['Uptime SLA', false, false, '99.95%'],
    ],
  },
];

/** Sticky first column: stays put while the plan columns scroll sideways on narrow screens. */
const STICKY = 'sticky left-0 z-10';
/** The recommended plan's column gets a faint tint. */
const HIGHLIGHT = 'bg-primary/5';

function Cell({ value }: { value: Value }) {
  if (value === true) return <Icon name="check" size={18} label="Included" className="inline-block text-primary-text" />;
  if (value === false) return <Icon name="minus" size={18} label="Not included" className="inline-block text-muted-foreground" />;
  return <span className="text-foreground">{value}</span>;
}

export default function PricingComparison() {
  return (
    <section aria-labelledby="compare-title" className="@container grid w-full gap-6 rounded-xl border border-border bg-background px-4 py-10 @2xl:px-10">
      <div className="grid gap-2">
        <h2 id="compare-title" className="font-display text-2xl font-semibold tracking-tight">
          Compare plans
        </h2>
        <p className="text-base text-muted-foreground">Every feature, side by side. Scroll sideways on small screens.</p>
      </div>

      <Table label="Plan comparison" className="min-w-[38rem] table-fixed" wrapperClassName="bg-card">
        <colgroup>
          <col className="w-[34%]" />
          {PLANS.map((p) => (
            <col key={p.id} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className={`${STICKY} bg-muted`}>
              <span className="sr-only">Feature</span>
            </TableHead>
            {PLANS.map((p) => (
              <TableHead key={p.id} align="center" className={p.popular ? 'h-auto py-4 bg-primary/10' : 'h-auto py-4'}>
                <span className="grid justify-items-center gap-1 whitespace-normal">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {p.name}
                    {p.popular && (
                      <Badge size="sm" solid>
                        Popular
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{p.price}</span>
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {GROUPS.map((group) => (
          <TableBody key={group.title}>
            <TableRow>
              <TableHead scope="rowgroup" colSpan={4} className="h-auto bg-transparent pt-6 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <span className="sticky left-4">{group.title}</span>
              </TableHead>
            </TableRow>
            {group.rows.map(([feature, ...values]) => (
              <TableRow key={feature}>
                <TableHead scope="row" className={`${STICKY} h-12 bg-card text-sm font-normal whitespace-normal text-foreground`}>
                  {feature}
                </TableHead>
                {values.map((v, i) => (
                  <TableCell key={PLANS[i]!.id} align="center" className={PLANS[i]!.popular ? HIGHLIGHT : undefined}>
                    <Cell value={v} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        ))}
        <TableFooter>
          <TableRow>
            <TableCell className={STICKY} />
            {PLANS.map((p) => (
              <TableCell key={p.id} align="center" className={p.popular ? `${HIGHLIGHT} py-4` : 'py-4'}>
                <Button size="sm" variant={p.popular ? 'primary' : 'outline'} aria-label={`${p.cta}: ${p.name}`}>
                  {p.cta}
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  );
}
