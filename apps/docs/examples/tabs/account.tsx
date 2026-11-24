import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-kit';

const field = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-ring';

export default function TabsAccount() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="grid gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h3 className="font-medium">Account</h3>
          <p className="text-muted-foreground">Make changes to your profile. Click save when you are done.</p>
        </div>
        <label className="grid gap-1.5 text-base font-medium">
          Name
          <input className={field} defaultValue="Ada Lovelace" />
        </label>
        <label className="grid gap-1.5 text-base font-medium">
          Email
          <input className={field} type="email" defaultValue="ada@atlas.dev" />
        </label>
        <Button className="justify-self-start">Save changes</Button>
      </TabsContent>
      <TabsContent value="password" className="grid gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h3 className="font-medium">Password</h3>
          <p className="text-muted-foreground">Use at least 12 characters. You will be signed out on other devices.</p>
        </div>
        <label className="grid gap-1.5 text-base font-medium">
          Current password
          <input className={field} type="password" autoComplete="current-password" />
        </label>
        <label className="grid gap-1.5 text-base font-medium">
          New password
          <input className={field} type="password" autoComplete="new-password" />
        </label>
        <Button className="justify-self-start">Update password</Button>
      </TabsContent>
      <TabsContent value="sessions" className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium">Active sessions</h3>
        <p className="text-muted-foreground">3 devices are signed in: MacBook Pro, iPhone 15 and Chrome on Windows.</p>
      </TabsContent>
    </Tabs>
  );
}
