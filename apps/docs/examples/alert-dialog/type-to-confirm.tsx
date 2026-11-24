'use client';

import { useState } from 'react';
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

const PROJECT = 'atlas-web';

export default function AlertDialogTypeToConfirm() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const matches = typed === PROJECT;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTyped('');
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent role="alertdialog" size="sm" dismissible={false} showClose={false}>
        <DialogHeader>
          <DialogTitle>Delete {PROJECT}?</DialogTitle>
          <DialogDescription>
            This permanently removes the project, 14 deployments and 9 environment variables. This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label className="grid gap-1.5 text-base font-medium">
            <span>
              Type <span className="rounded-sm bg-muted px-1 font-mono text-sm">{PROJECT}</span> to confirm
            </span>
            <input
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-ring"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" disabled={!matches}>
              Delete project
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
