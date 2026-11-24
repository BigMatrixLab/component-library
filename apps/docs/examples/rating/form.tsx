'use client';

import { useState, type FormEvent } from 'react';
import { Button, Rating } from 'ui-kit';

export default function RatingForm() {
  const [sent, setSent] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(`Sent: service=${data.get('service') ?? '–'}, speed=${data.get('speed') ?? '–'}`);
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Service</span>
        <Rating name="service" aria-label="Service" required />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Speed</span>
        <Rating name="speed" aria-label="Speed" allowHalf />
      </div>
      <Button type="submit">Send feedback</Button>
      <p className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {sent}
      </p>
    </form>
  );
}
