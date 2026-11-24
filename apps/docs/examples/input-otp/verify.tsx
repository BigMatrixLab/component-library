'use client';

import { useState } from 'react';
import { InputOTP } from 'ui-kit';

export default function OtpVerify() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'ok'>('idle');

  const verify = (value: string) => {
    // Demo only: the right code is 482913
    setStatus(value === '482913' ? 'ok' : 'error');
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">Enter the 6-digit code we sent to a•••@northwind.com</p>
      <InputOTP
        length={6}
        value={code}
        onValueChange={(v) => {
          setCode(v);
          setStatus('idle');
        }}
        onComplete={verify}
        invalid={status === 'error'}
        aria-label="Verification code"
      />
      <p
        className={status === 'error' ? 'text-sm text-destructive-text' : status === 'ok' ? 'text-sm text-success-text' : 'text-sm text-muted-foreground'}
        aria-live="polite"
      >
        {status === 'error' ? 'That code is incorrect. Try again.' : status === 'ok' ? 'Verified. Redirecting…' : 'Try 482913, or paste any 6 digits'}
      </p>
    </div>
  );
}
