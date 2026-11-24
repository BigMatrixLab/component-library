import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from 'ui-kit';

/**
 * The same small slice of real UI, scoped to one pack and one mode with
 * `data-theme` on the wrapper. Light previews carry data-theme-mode="light"
 * so they stay light on a dark page; dark previews carry the `dark` class.
 */
export function PackPreview({ pack, mode }: { pack: string; mode: 'light' | 'dark' }) {
  const label = `${pack} pack, ${mode}`;
  return (
    <div
      data-theme={pack}
      data-theme-mode={mode === 'light' ? 'light' : undefined}
      data-pack-preview={`${pack}-${mode}`}
      role="group"
      aria-label={label}
      className={cn('rounded-xl border border-border bg-background p-4 text-foreground', mode === 'dark' && 'dark')}
    >
      <p className="mb-3 text-xs font-medium text-muted-foreground">{mode === 'light' ? 'Light' : 'Dark'}</p>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Team plan</CardTitle>
          <CardDescription>12 seats · renews 14 December</CardDescription>
          <CardAction>
            <Badge variant="success" dot>
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue="monthly">
            <TabsList aria-label="Billing period">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="pt-2 text-sm text-muted-foreground">
              $48 a month, cancel any time.
            </TabsContent>
            <TabsContent value="yearly" className="pt-2 text-sm text-muted-foreground">
              $480 a year, two months free.
            </TabsContent>
          </Tabs>
          <Field>
            <Label>Billing email</Label>
            <Input type="email" defaultValue="finance@northwind.com" />
          </Field>
          <Switch label="Usage alerts" description="Email me at 80% of the plan." defaultChecked />
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm" variant="outline">
            Cancel
          </Button>
          <Button size="sm">Upgrade</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
