'use client';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'ui-kit';

export default function AlertDialogDestructive() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Revoke API key</Button>
      </DialogTrigger>
      <DialogContent role="alertdialog" size="sm" dismissible={false} showClose={false}>
        <DialogHeader>
          <DialogTitle>Revoke “Production key”?</DialogTitle>
          <DialogDescription>
            Anything still using this key stops working immediately. Create a new key first if you need a replacement.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Cancel is the safe default, so it takes focus */}
          <DialogClose asChild>
            <Button variant="outline" autoFocus>
              Keep key
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Revoke key</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
