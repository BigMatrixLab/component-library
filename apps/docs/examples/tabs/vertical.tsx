import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-kit';

export default function TabsVertical() {
  return (
    <Tabs defaultValue="general" variant="underline" orientation="vertical" activationMode="manual" className="w-full max-w-lg">
      <TabsList aria-label="Project settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="domains">Domains</TabsTrigger>
        <TabsTrigger value="env">Environment</TabsTrigger>
        <TabsTrigger value="danger">Danger zone</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <h3 className="font-medium">General</h3>
        <p className="text-muted-foreground">Project name, framework preset and build command. Press Enter to open a tab.</p>
      </TabsContent>
      <TabsContent value="domains">
        <h3 className="font-medium">Domains</h3>
        <p className="text-muted-foreground">atlas.dev and www.atlas.dev point to production.</p>
      </TabsContent>
      <TabsContent value="env">
        <h3 className="font-medium">Environment</h3>
        <p className="text-muted-foreground">9 variables across production and preview.</p>
      </TabsContent>
      <TabsContent value="danger">
        <h3 className="font-medium">Danger zone</h3>
        <p className="text-muted-foreground">Transfer or delete this project.</p>
      </TabsContent>
    </Tabs>
  );
}
