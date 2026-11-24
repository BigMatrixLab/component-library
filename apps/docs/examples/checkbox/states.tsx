'use client';

import { useState } from 'react';
import { Checkbox } from 'ui-kit';

export default function CheckboxStates() {
  const [terms, setTerms] = useState(false);

  return (
    <div className="grid gap-4">
      <Checkbox label="Email me about new comments" defaultChecked />
      <Checkbox label="Send a weekly summary" />
      <Checkbox label="Beta features" description="Available on the Team plan." disabled />
      <Checkbox label="Two-factor authentication" disabled defaultChecked />
      <Checkbox
        label="I accept the terms of service"
        description={terms ? 'Thanks, you can continue.' : 'You need to accept before you can continue.'}
        checked={terms}
        onCheckedChange={setTerms}
        invalid={!terms}
      />
    </div>
  );
}
