'use client';

import { useRef, useState } from 'react';
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

export default function AlertDialogAsyncConfirm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const attempts = useRef(0);

  // Stand-in for a network call: the first try fails so the error path is visible
  const remove = async () => {
    setPending(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));
    setPending(false);
    if (attempts.current++ === 0) {
      setError('We couldn’t reach the server. Nothing was removed.');
      return;
    }
    setRemoved(true);
    setOpen(false);
  };

  return (
    <div className="grid justify-items-center gap-3">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          // Stay open while the request runs
          if (pending) return;
          setOpen(next);
          if (next) setError(null);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={removed}>
            {removed ? 'Member removed' : 'Remove member'}
          </Button>
        </DialogTrigger>
        <DialogContent role="alertdialog" size="sm" dismissible={false} showClose={false}>
          <DialogHeader>
            <DialogTitle>Remove Grace Hopper?</DialogTitle>
            <DialogDescription>
              She loses access to Atlas right away. Her commits and comments stay.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-base text-destructive-text">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" loading={pending} onClick={remove}>
              {error ? 'Try again' : 'Remove member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {removed ? 'Grace Hopper was removed from Atlas.' : '4 members on the Atlas team'}
      </p>
    </div>
  );
}
