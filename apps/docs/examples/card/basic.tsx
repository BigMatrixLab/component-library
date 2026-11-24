import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Icon } from 'ui-kit';

export default function CardBasic() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Billed monthly. Renews on 14 December 2026.</CardDescription>
        <CardAction>
          <Badge variant="success" dot>Active</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          $48<span className="text-base font-normal text-muted-foreground"> / month</span>
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {['12 seats included', 'Unlimited projects', 'Priority support'].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Icon name="check" className="text-foreground" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button size="sm">Manage plan</Button>
        <Button size="sm" variant="ghost">
          View invoices
        </Button>
      </CardFooter>
    </Card>
  );
}
