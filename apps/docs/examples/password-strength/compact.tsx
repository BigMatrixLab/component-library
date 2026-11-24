'use client';

import { useId, useState } from 'react';
import { Button, Field, FieldHint, Label, PasswordInput, PasswordStrength, scorePassword } from 'ui-kit';

export default function PasswordStrengthCompact() {
  const [password, setPassword] = useState('');
  const strengthId = useId();
  const strongEnough = scorePassword(password).score >= 3;

  return (
    <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Field>
        <Label>New password</Label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={strengthId}
        />
        <PasswordStrength
          id={strengthId}
          value={password}
          showChecklist={false}
          labels={{ weak: 'Too weak', fair: 'Okay', good: 'Good', strong: 'Excellent' }}
          className="mt-1"
        />
        <FieldHint>Use 12 or more characters. A short sentence works well.</FieldHint>
      </Field>
      <Button type="submit" disabled={!strongEnough} className="self-start">
        Update password
      </Button>
    </form>
  );
}
