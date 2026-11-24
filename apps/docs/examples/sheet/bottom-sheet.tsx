import {
  Button,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  type IconName,
} from 'ui-kit';

const actions: { label: string; hint: string; icon: IconName }[] = [
  { label: 'Copy link', hint: 'atlas.dev/q3-report', icon: 'link' },
  { label: 'Send by email', hint: 'Opens your mail app', icon: 'mail' },
  { label: 'Download PDF', hint: '2.4 MB', icon: 'download' },
];

export default function SheetBottom() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Share report</Button>
      </SheetTrigger>
      <SheetContent side="bottom" showClose={false}>
        <SheetHeader className="pr-6">
          <SheetTitle>Share “Q3 report”</SheetTitle>
          <SheetDescription>Drag the handle down or press Esc to dismiss.</SheetDescription>
        </SheetHeader>
        <ul className="grid gap-1 px-3 pb-4">
          {actions.map(({ label, hint, icon }) => (
            <li key={label}>
              <SheetClose asChild>
                <button type="button" className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-start hover:bg-accent">
                  <Icon name={icon} size={18} className="text-muted-foreground" />
                  <span className="grid">
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">{hint}</span>
                  </span>
                </button>
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
