'use client';

import { useState } from 'react';
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

export default function DialogConfirm() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent role="alertdialog" size="sm" dismissible={false} showClose={false}>
        <DialogHeader>
          <DialogTitle>Delete “Atlas”?</DialogTitle>
          <DialogDescription>
            This removes the project, its 14 deployments and all environment variables. You can’t undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" loading={deleting} onClick={remove}>
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
