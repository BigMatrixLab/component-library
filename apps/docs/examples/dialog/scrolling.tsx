import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'ui-kit';

const sections = [
  ['Your account', 'You are responsible for keeping your password secret and for everything that happens under your account.'],
  ['Your content', 'You keep ownership of what you upload. You give us permission to store and display it so the service works.'],
  ['Payments', 'Paid plans renew automatically each month or year until you cancel from the billing page.'],
  ['Changes', 'If a change to these terms is material, we email you at least 30 days before it applies.'],
  ['Closing your account', 'You can close your account at any time. We delete your data within 30 days.'],
];

export default function DialogScrolling() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Review terms</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Last updated 1 November 2026.</DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[45dvh] overflow-y-auto pr-1">
          {sections.map(([title, text]) => (
            <div key={title}>
              <h3 className="mb-1 font-medium">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
