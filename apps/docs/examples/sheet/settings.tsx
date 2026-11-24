import {
  Button,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'ui-kit';

const field = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-ring';

const channels = [
  ['Deploy finished', 'Email when a production deploy succeeds or fails.', true],
  ['Weekly summary', 'A Monday digest of traffic and errors.', true],
  ['Billing alerts', 'Invoices, failed payments and plan changes.', false],
] as const;

export default function SheetSettings() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Notification settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notification settings</SheetTitle>
          <SheetDescription>Choose what we send to ada@atlas.dev.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <label className="grid gap-1.5 text-base font-medium">
            Reply-to address
            <input className={field} defaultValue="team@atlas.dev" autoFocus />
          </label>
          <fieldset className="grid gap-3">
            <legend className="mb-1 text-base font-medium">Email me about</legend>
            {channels.map(([label, hint, on]) => (
              <label key={label} className="flex items-start gap-3">
                <input type="checkbox" defaultChecked={on} className="mt-0.5 size-4 accent-primary" />
                <span className="grid">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
