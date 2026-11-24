import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, Empty, EmptyActions, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Icon } from 'ui-kit';

export default function EmptyInCard() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Everything you have billed this year.</CardDescription>
        <CardAction>
          <Badge variant="secondary">0 total</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Icon name="file" />
            </EmptyMedia>
            <EmptyTitle as="h4">No invoices in 2026</EmptyTitle>
            <EmptyDescription>Invoices you send appear here with their payment status.</EmptyDescription>
          </EmptyHeader>
          <EmptyActions>
            <Button size="sm">Create invoice</Button>
          </EmptyActions>
        </Empty>
      </CardContent>
    </Card>
  );
}
