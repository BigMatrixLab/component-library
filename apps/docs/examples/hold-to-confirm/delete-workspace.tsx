'use client';

import { useState } from 'react';
import { HoldToConfirm, Icon } from 'ui-kit';

export default function HoldToConfirmDeleteWorkspace() {
  const [deleted, setDeleted] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      <HoldToConfirm
        leadingIcon={<Icon name="trash" />}
        doneLabel="Workspace deleted"
        onConfirm={() => setDeleted((n) => n + 1)}
      >
        Hold to delete workspace
      </HoldToConfirm>
      <p className="text-sm text-muted-foreground">
        {deleted ? `“Northwind” was deleted (demo only). Count: ${deleted}.` : 'Hold for 1.2 seconds. Let go early to cancel.'}
      </p>
    </div>
  );
}
