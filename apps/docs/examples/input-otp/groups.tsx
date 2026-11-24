'use client';

import { InputOTP } from 'ui-kit';

export default function OtpGroups() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">Authenticator app code</p>
      <InputOTP groups={[3, 3]} aria-label="Authenticator code" />
    </div>
  );
}
