'use client';

import { HoldToConfirm } from 'ui-kit';

export default function HoldToConfirmDuration() {
  return (
    <>
      <HoldToConfirm size="sm" duration={800} doneLabel="Key revoked" onConfirm={() => undefined}>
        Revoke API key
      </HoldToConfirm>
      <HoldToConfirm size="lg" duration={2000} doneLabel="Account closed" onConfirm={() => undefined}>
        Hold to close account
      </HoldToConfirm>
    </>
  );
}
