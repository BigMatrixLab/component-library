'use client';

import { useState } from 'react';
import { AlertDescription, AlertTitle, Button, DismissibleAlert } from 'ui-kit';

export default function AlertDismissible() {
  const [open, setOpen] = useState(true);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <DismissibleAlert variant="success" open={open} onOpenChange={setOpen}>
        <AlertTitle>Welcome to Atlas</AlertTitle>
        <AlertDescription>Your workspace is ready. Invite your team whenever you like.</AlertDescription>
      </DismissibleAlert>
      <div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={open}>
          Show again
        </Button>
      </div>
    </div>
  );
}
