'use client';

import { useId, useState } from 'react';
import { Field, Label, PasswordInput, PasswordStrength, type PasswordRequirement } from 'ui-kit';

// Defined once, outside the component, so the list keeps its identity between renders
const workspaceRules: PasswordRequirement[] = [
  { id: 'length', label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { id: 'words', label: 'Two or more words', test: (p) => p.trim().split(/[\s-]+/).filter(Boolean).length >= 2 },
  { id: 'name', label: 'Doesn’t contain “northwind”', test: (p) => !p.toLowerCase().includes('northwind') },
];

export default function PasswordStrengthCustomRules() {
  const [password, setPassword] = useState('');
  const strengthId = useId();

  return (
    <div className="w-full max-w-sm">
      <Field>
        <Label>Workspace passphrase</Label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={strengthId}
        />
        <PasswordStrength id={strengthId} value={password} requirements={workspaceRules} className="mt-1.5" />
      </Field>
    </div>
  );
}
