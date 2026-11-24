'use client';

import { ActionButton, Icon } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ActionButtonSaveDraft() {
  return (
    <>
      <ActionButton onAction={() => wait(1200)} pendingLabel="Saving…" successLabel="Draft saved">
        Save draft
      </ActionButton>
      <ActionButton
        variant="outline"
        idleIcon={<Icon name="mail" />}
        onAction={() => wait(1500)}
        pendingLabel="Sending…"
        successLabel="Invoice sent"
      >
        Send invoice
      </ActionButton>
    </>
  );
}
