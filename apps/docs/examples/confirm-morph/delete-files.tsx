'use client';

import { ConfirmMorph, Icon } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ConfirmMorphDeleteFiles() {
  return (
    <ConfirmMorph
      icon={<Icon name="trash" />}
      label="Delete 3 files"
      question="Delete 3 files?"
      pendingLabel="Deleting…"
      resultLabel="3 files deleted"
      onConfirm={() => wait(1100)}
      onUndo={() => wait(300)}
    />
  );
}
