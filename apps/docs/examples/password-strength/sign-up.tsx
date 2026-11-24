'use client';

import { useId, useState } from 'react';
import { Field, Label, PasswordInput, PasswordStrength } from 'ui-kit';

export default function PasswordStrengthSignUp() {
  const [password, setPassword] = useState('');
  const strengthId = useId();

  return (
    <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
      <Field>
        <Label>Create a password</Label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={strengthId}
        />
        <PasswordStrength id={strengthId} value={password} className="mt-1.5" />
      </Field>
    </form>
  );
}
