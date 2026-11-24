'use client';

import { useState } from 'react';
import { Switch } from 'ui-kit';

export default function SwitchStates() {
  const [autosave, setAutosave] = useState(true);

  return (
    <div className="grid gap-4">
      <Switch label="Auto-save drafts" checked={autosave} onCheckedChange={setAutosave} name="autosave" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {autosave ? 'Drafts are saved every 30 seconds.' : 'Drafts are only saved when you click save.'}
      </p>
      <Switch label="Single sign-on" description="Managed by your administrator." disabled defaultChecked />
      <Switch label="Audit export" disabled />
    </div>
  );
}
