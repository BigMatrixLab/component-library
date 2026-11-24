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

const field = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-ring';

export default function DialogEditProfile() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved to your account when you click save.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label className="grid gap-1.5 text-base font-medium">
            Name
            <input className={field} defaultValue="Ada Lovelace" autoFocus />
          </label>
          <label className="grid gap-1.5 text-base font-medium">
            Username
            <input className={field} defaultValue="@ada" />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
