'use client';

import { useRef } from 'react';
import { ActionButton } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ActionButtonRetry() {
  const attempts = useRef(0);

  // The first attempt fails, the second succeeds
  const sync = async () => {
    attempts.current += 1;
    await wait(1000);
    if (attempts.current % 2 === 1) throw new Error('Offline');
  };

  return (
    <ActionButton variant="secondary" onAction={sync} pendingLabel="Syncing…" successLabel="Contacts synced" errorLabel="Sync failed">
      Sync contacts
    </ActionButton>
  );
}
