'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldHint,
  Form,
  Icon,
  Input,
  Label,
  NativeSelect,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type IconName,
} from 'ui-kit';

const SECTIONS: { value: string; label: string; icon: IconName }[] = [
  { value: 'account', label: 'Account', icon: 'user' },
  { value: 'notifications', label: 'Notifications', icon: 'bell' },
  { value: 'billing', label: 'Billing', icon: 'credit-card' },
  { value: 'danger', label: 'Danger zone', icon: 'triangle-alert' },
];

const WORKSPACE = 'northwind-finance';

/** Vertical tabs when the block is wide enough, a scrolling row of tabs when it isn't. */
function useWide<T extends HTMLElement>(min: number) {
  const ref = useRef<T>(null);
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWide(entry!.contentRect.width >= min));
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, wide] as const;
}

/** Fake request: resolves after a short delay so loading states are visible. */
function useSave() {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const save = () => {
    setState('saving');
    setTimeout(() => setState('saved'), 900);
  };
  return { state, save, reset: () => state === 'saved' && setState('idle') };
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="grid gap-1">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-base text-muted-foreground">{description}</p>
    </header>
  );
}

function SaveBar({ state, label = 'Save changes' }: { state: 'idle' | 'saving' | 'saved'; label?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
      <span role="status" className="flex items-center gap-1.5 text-sm text-success-text">
        {state === 'saved' && (
          <>
            <Icon name="check" size={16} />
            Saved
          </>
        )}
      </span>
      <Button type="submit" loading={state === 'saving'}>
        {label}
      </Button>
    </div>
  );
}

function AccountPanel() {
  const { state, save, reset } = useSave();
  const [nameError, setNameError] = useState<string>();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
    if (!input.value.trim()) {
      setNameError('Enter your name. It’s shown on comments and invoices.');
      input.focus();
      return;
    }
    save();
  };
  return (
    <Form noValidate onSubmit={submit} onChange={reset} aria-label="Profile" className="gap-6">
      <PanelHeader title="Profile" description="This is how teammates see you across Lumen." />
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="xl">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Icon name="upload" />
            Upload photo
          </Button>
          <Button variant="ghost" size="sm">
            Remove
          </Button>
        </div>
        <p className="w-full text-sm text-muted-foreground">PNG or JPG, at least 256 × 256px.</p>
      </div>
      <div className="grid gap-4 @xl:grid-cols-2">
        <Field invalid={!!nameError}>
          <Label>Full name</Label>
          <Input name="name" autoComplete="name" defaultValue="Ada Lovelace" onChange={() => setNameError(undefined)} />
          <FieldError>{nameError}</FieldError>
        </Field>
        <Field>
          <Label>Display name</Label>
          <Input name="handle" defaultValue="ada" />
          <FieldHint>Used for @mentions.</FieldHint>
        </Field>
      </div>
      <Field>
        <div className="flex items-center gap-2">
          <Label>Email</Label>
          <Badge variant="success" size="sm">
            Verified
          </Badge>
        </div>
        <Input name="email" type="email" defaultValue="ada@northwind.com" readOnly />
        <FieldHint>To change your email, contact your workspace owner.</FieldHint>
      </Field>
      <Field>
        <Label>Bio</Label>
        <Textarea name="bio" rows={3} maxLength={160} showCount defaultValue="Finance lead. I keep the monthly close on schedule." />
      </Field>
      <Field>
        <Label>Time zone</Label>
        <NativeSelect name="tz" defaultValue="Europe/London">
          <option value="America/Los_Angeles">Pacific Time (UTC−08:00)</option>
          <option value="America/New_York">Eastern Time (UTC−05:00)</option>
          <option value="Europe/London">London (UTC+00:00)</option>
          <option value="Europe/Berlin">Berlin (UTC+01:00)</option>
          <option value="Asia/Kolkata">India (UTC+05:30)</option>
        </NativeSelect>
      </Field>
      <SaveBar state={state} />
    </Form>
  );
}

const EMAIL_PREFS = [
  { name: 'mentions', label: 'Mentions and replies', description: 'When someone @mentions you or replies to your comment.', on: true },
  { name: 'approvals', label: 'Approval requests', description: 'Expenses and invoices waiting for your sign-off.', on: true },
  { name: 'digest', label: 'Weekly digest', description: 'A Monday summary of spend, runway and open tasks.', on: false },
  { name: 'product', label: 'Product updates', description: 'New features and improvements, about once a month.', on: false },
];

function NotificationsPanel() {
  const { state, save, reset } = useSave();
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onClick={reset}
      aria-label="Notifications"
      className="gap-6"
    >
      <PanelHeader title="Notifications" description="Choose what reaches your inbox and your phone." />
      <section className="grid gap-4" aria-labelledby="notify-email">
        <h3 id="notify-email" className="text-md font-semibold">
          Email
        </h3>
        {EMAIL_PREFS.map((p) => (
          <Switch key={p.name} name={p.name} defaultChecked={p.on} label={p.label} description={p.description} labelPosition="start" />
        ))}
        <Switch name="receipts" defaultChecked disabled label="Billing receipts" description="Always on while your workspace is on a paid plan." labelPosition="start" />
      </section>
      <Separator />
      <section className="grid gap-4" aria-labelledby="notify-push">
        <h3 id="notify-push" className="text-md font-semibold">
          Push notifications
        </h3>
        <RadioGroup name="push" defaultValue="mentions" aria-labelledby="notify-push">
          <RadioGroupItem value="all" label="All new activity" description="Comments, approvals and status changes in projects you follow." />
          <RadioGroupItem value="mentions" label="Mentions and direct messages" description="Only things addressed to you." />
          <RadioGroupItem value="none" label="Nothing" description="You’ll still see everything in the inbox." />
        </RadioGroup>
      </section>
      <SaveBar state={state} label="Save preferences" />
    </Form>
  );
}

const INVOICES = [
  { id: 'INV-2026-011', date: 'Nov 12, 2026', amount: '$240.00' },
  { id: 'INV-2026-010', date: 'Oct 12, 2026', amount: '$240.00' },
  { id: 'INV-2026-009', date: 'Sep 12, 2026', amount: '$216.00' },
];

function BillingPanel() {
  return (
    <div className="grid gap-6">
      <PanelHeader title="Billing" description="Your plan, usage and invoices. Prices exclude VAT." />
      <div className="grid gap-4 rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold">Pro plan</h3>
              <Badge variant="success" size="sm" dot>
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">$24 per seat / month · renews on Dec 12, 2026</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Cancel plan
            </Button>
            <Button size="sm">Upgrade to Business</Button>
          </div>
        </div>
        <Separator />
        <div className="grid gap-5 @xl:grid-cols-2">
          {[
            { label: 'Seats', used: 8, max: 10, text: '8 of 10' },
            { label: 'Storage', used: 82.6, max: 100, text: '82.6 of 100 GB' },
          ].map((m) => (
            <div key={m.label} className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{m.label}</span>
                <span className="text-muted-foreground tabular-nums">{m.text}</span>
              </div>
              <Progress value={m.used} max={m.max} tone={m.used / m.max >= 0.8 ? 'warning' : 'default'} aria-label={`${m.label} used`} getValueText={() => m.text} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-12 place-items-center rounded-md border border-border bg-muted text-xs font-semibold">VISA</span>
          <div className="grid text-sm">
            <span className="font-medium">Visa ending in 4242</span>
            <span className="text-muted-foreground">Expires 08/2028 · billing@northwind.com</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Update card
        </Button>
      </div>
      <div className="grid gap-3">
        <h3 className="text-md font-semibold">Invoices</h3>
        <Table label="Invoices">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead numeric>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Download</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium whitespace-nowrap">{inv.id}</TableCell>
                <TableCell className="whitespace-nowrap">{inv.date}</TableCell>
                <TableCell numeric>{inv.amount}</TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">
                    Paid
                  </Badge>
                </TableCell>
                <TableCell align="right">
                  <Button variant="ghost" size="sm" icon aria-label={`Download ${inv.id}`}>
                    <Icon name="download" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DangerPanel() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const remove = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
      setScheduled(true);
    }, 1200);
  };

  return (
    <div className="grid gap-6">
      <PanelHeader title="Danger zone" description="Actions here are permanent or hard to undo. Take a moment." />
      {scheduled && (
        <Alert variant="warning" role="alert">
          <AlertTitle>Workspace scheduled for deletion</AlertTitle>
          <AlertDescription>
            {WORKSPACE} and its data will be deleted on Dec 25, 2026. Until then you can restore it.{' '}
            <Button variant="link" size="sm" className="h-auto px-0" onClick={() => setScheduled(false)}>
              Restore workspace
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="divide-y divide-border rounded-xl border border-destructive/40">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="grid max-w-md gap-1">
            <h3 className="text-md font-semibold">Transfer ownership</h3>
            <p className="text-sm text-muted-foreground">Make another admin the owner. You stay on as an admin.</p>
          </div>
          <Button variant="outline">Transfer</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="grid max-w-md gap-1">
            <h3 className="text-md font-semibold">Export all data</h3>
            <p className="text-sm text-muted-foreground">A ZIP of every ledger, invoice and attachment, emailed to you.</p>
          </div>
          <Button variant="outline">
            <Icon name="download" />
            Export
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="grid max-w-md gap-1">
            <h3 className="text-md font-semibold text-destructive-text">Delete workspace</h3>
            <p className="text-sm text-muted-foreground">Deletes {WORKSPACE}, its 14 members’ access and 3 years of records after 30 days.</p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setConfirm('');
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={scheduled}>
                Delete workspace
              </Button>
            </DialogTrigger>
            <DialogContent role="alertdialog" size="sm" dismissible={!deleting}>
              <DialogHeader>
                <DialogTitle>Delete {WORKSPACE}?</DialogTitle>
                <DialogDescription>Everyone loses access right away. The data is deleted for good after 30 days.</DialogDescription>
              </DialogHeader>
              <Field>
                <Label>
                  Type <span className="font-mono font-semibold">{WORKSPACE}</span> to confirm
                </Label>
                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" spellCheck={false} autoFocus />
              </Field>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={deleting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button variant="destructive" loading={deleting} disabled={confirm !== WORKSPACE} onClick={remove}>
                  Delete workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default function SettingsSidebarTabs() {
  const [ref, wide] = useWide<HTMLDivElement>(672);
  const panel = wide ? 'max-w-2xl' : 'mx-5';
  return (
    <div ref={ref} className="@container w-full overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-5 py-5 @2xl:px-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-base text-muted-foreground">Manage your profile, notifications and the Northwind Finance workspace.</p>
      </div>
      <Tabs
        defaultValue="account"
        variant="underline"
        orientation={wide ? 'vertical' : 'horizontal'}
        className={wide ? 'gap-8 px-8 py-6' : 'gap-5 py-4'}
      >
        <TabsList aria-label="Settings sections" className={wide ? 'w-48' : 'mx-5'}>
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className={s.value === 'danger' ? 'data-[state=active]:text-destructive-text' : undefined}>
              <Icon name={s.icon} />
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="account" className={panel}>
          <AccountPanel />
        </TabsContent>
        <TabsContent value="notifications" className={panel}>
          <NotificationsPanel />
        </TabsContent>
        <TabsContent value="billing" className={panel}>
          <BillingPanel />
        </TabsContent>
        <TabsContent value="danger" className={panel}>
          <DangerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
