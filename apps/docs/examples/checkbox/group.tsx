'use client';

import { useState } from 'react';
import { Checkbox } from 'ui-kit';

const topics = ['Comments', 'Mentions', 'Deployments'];

export default function CheckboxGroup() {
  const [selected, setSelected] = useState<string[]>(['Comments']);
  const all = selected.length === topics.length;
  const some = selected.length > 0 && !all;

  const toggle = (topic: string, on: boolean) =>
    setSelected((prev) => (on ? [...prev, topic] : prev.filter((t) => t !== topic)));

  return (
    <div className="grid gap-3" role="group" aria-label="Notification topics">
      <Checkbox
        label="All activity"
        checked={all}
        indeterminate={some}
        onCheckedChange={(on) => setSelected(on ? topics : [])}
      />
      <div className="ml-7 grid gap-3">
        {topics.map((topic) => (
          <Checkbox key={topic} label={topic} checked={selected.includes(topic)} onCheckedChange={(on) => toggle(topic, on)} />
        ))}
      </div>
    </div>
  );
}
