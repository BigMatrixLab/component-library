'use client';

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, toast } from 'ui-kit';

export default function ToastInDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite teammate</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>Toasts render in the top layer, so they appear above this dialog and stay interactive.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() =>
              toast.success('Invitation sent', {
                description: 'priya@northwind.example will get an email shortly.',
                action: { label: 'Undo', onClick: () => toast('Invitation withdrawn') },
              })
            }
          >
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
