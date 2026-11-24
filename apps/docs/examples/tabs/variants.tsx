import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsVariant } from 'ui-kit';

const variants: TabsVariant[] = ['segmented', 'underline', 'pills'];

export default function TabsVariants() {
  return (
    <div className="grid w-full max-w-md gap-8">
      {variants.map((variant) => (
        <Tabs key={variant} defaultValue="overview" variant={variant}>
          <TabsList aria-label={`${variant} tabs`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="archived" disabled>
              Archived
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-muted-foreground">
            The {variant} variant: 12 projects, 3 need review.
          </TabsContent>
          <TabsContent value="activity" className="text-muted-foreground">
            Last deploy was 14 minutes ago by Ada.
          </TabsContent>
          <TabsContent value="settings" className="text-muted-foreground">
            Rename, transfer or delete the workspace.
          </TabsContent>
        </Tabs>
      ))}
    </div>
  );
}
