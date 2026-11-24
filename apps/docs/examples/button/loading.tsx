'use client';

import { useState } from 'react';
import { Button } from 'ui-kit';

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  };

  return (
    <>
      <Button loading={saving} onClick={save}>
        Save draft
      </Button>
      <Button variant="outline" loading>
        Uploading
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Unavailable
      </Button>
    </>
  );
}
