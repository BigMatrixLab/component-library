'use client';

import { InputOTP } from 'ui-kit';

export default function OtpSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP size="sm" length={4} defaultValue="29" aria-label="Small code" />
      <InputOTP length={4} defaultValue="29" aria-label="Default code" />
      <InputOTP size="lg" length={4} defaultValue="29" aria-label="Large code" />
      <InputOTP length={4} defaultValue="2948" disabled aria-label="Disabled code" />
    </div>
  );
}
