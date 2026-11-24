'use client';

import { useState } from 'react';
import {
  Field,
  FieldHint,
  Label,
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectInput,
  MultiSelectItem,
} from 'ui-kit';

const channels = ['General', 'Design', 'Engineering', 'Support', 'Marketing', 'Finance', 'Random'];

export default function MultiSelectMaxSelection() {
  const [selected, setSelected] = useState<string[]>(['General', 'Design', 'Engineering']);

  return (
    <Field className="w-full max-w-md">
      <Label>Notify channels</Label>
      <MultiSelect value={selected} onValueChange={setSelected} max={4}>
        <MultiSelectInput placeholder="Choose up to four channels" maxChips={2} />
        <MultiSelectContent>
          {channels.map((name) => (
            <MultiSelectItem key={name} value={name}>
              {name}
            </MultiSelectItem>
          ))}
          <MultiSelectEmpty>No channels found.</MultiSelectEmpty>
        </MultiSelectContent>
      </MultiSelect>
      <FieldHint>Release notes post to every channel you pick, up to four.</FieldHint>
    </Field>
  );
}
