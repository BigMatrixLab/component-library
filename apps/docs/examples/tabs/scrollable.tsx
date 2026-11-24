import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-kit';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TabsScrollable() {
  return (
    <Tabs defaultValue="June" variant="pills" className="w-full max-w-xs">
      <TabsList aria-label="Month">
        {months.map((m) => (
          <TabsTrigger key={m} value={m}>
            {m}
          </TabsTrigger>
        ))}
      </TabsList>
      {months.map((m) => (
        <TabsContent key={m} value={m} className="text-muted-foreground">
          Invoices for {m}: {months.indexOf(m) + 3} issued.
        </TabsContent>
      ))}
    </Tabs>
  );
}
