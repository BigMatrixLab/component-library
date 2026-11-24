'use client';

import { useRef } from 'react';
import { ConfirmMorph, Icon } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ConfirmMorphFailure() {
  const attempts = useRef(0);

  // The first attempt fails; Retry succeeds
  const remove = async () => {
    attempts.current += 1;
    await wait(900);
    if (attempts.current === 1) throw new Error('Network error');
  };

  return (
    <ConfirmMorph
      size="lg"
      icon={<Icon name="trash" />}
      label="Remove member"
      question="Remove Priya Nair?"
      confirmLabel="Remove"
      pendingLabel="Removing…"
      resultLabel="Priya removed"
      errorLabel="Couldn’t remove"
      onConfirm={remove}
    />
  );
}
