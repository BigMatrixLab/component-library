'use client';

import { useState } from 'react';
import { InputOTP } from 'ui-kit';

export default function OtpAlphanumeric() {
  const [invite, setInvite] = useState('');

  return (
    <form className="flex flex-col items-center gap-3" onSubmit={(e) => e.preventDefault()}>
      <p className="text-sm text-muted-foreground">Workspace invite code</p>
      <InputOTP
        name="invite"
        length={8}
        groups={[4, 4]}
        pattern="alphanumeric"
        value={invite}
        onValueChange={(v) => setInvite(v.toUpperCase())}
        aria-label="Invite code"
      />
    </form>
  );
}
