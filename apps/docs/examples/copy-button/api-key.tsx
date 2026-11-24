'use client';

import { useState } from 'react';
import { CopyButton, Field, Icon, Input, InputAction, InputGroup, InputIcon, Label } from 'ui-kit';

const KEY = 'demo_key_7f3a9c2e1b8d4f60';

export default function ApiKeyCopy() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="grid w-full max-w-md gap-2">
      <Field>
        <Label>Secret API key</Label>
        <InputGroup>
          <InputIcon>
            <Icon name="lock" />
          </InputIcon>
          <Input readOnly value={revealed ? KEY : `${KEY.slice(0, 8)}${'•'.repeat(20)}`} className="font-mono text-[13px]" />
          <InputAction aria-label={revealed ? 'Hide key' : 'Show key'} onClick={() => setRevealed((v) => !v)}>
            <Icon name={revealed ? 'eye-off' : 'eye'} />
          </InputAction>
          <CopyButton value={KEY} aria-label="Copy API key" size="xs" />
        </InputGroup>
      </Field>
      <p className="text-sm text-muted-foreground">Keep this key private. Rotate it from the dashboard if it is ever exposed.</p>
    </div>
  );
}
