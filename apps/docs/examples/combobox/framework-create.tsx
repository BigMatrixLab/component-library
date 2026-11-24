'use client';

import { useState } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  Field,
  FieldHint,
  Label,
} from 'ui-kit';

export default function ComboboxFrameworkCreate() {
  const [frameworks, setFrameworks] = useState(['Next.js', 'Nuxt', 'Remix', 'SvelteKit', 'Astro']);
  const [value, setValue] = useState('Next.js');

  return (
    <Field className="w-full max-w-sm">
      <Label>Primary framework</Label>
      <Combobox value={value} onValueChange={setValue}>
        <ComboboxInput placeholder="Pick or add a framework" />
        <ComboboxContent>
          {frameworks.map((name) => (
            <ComboboxItem key={name} value={name}>
              {name}
            </ComboboxItem>
          ))}
          <ComboboxCreate onCreate={(name) => setFrameworks((list) => [...list, name])} />
          <ComboboxEmpty>Type a name to add it.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
      <FieldHint>Not listed? Type its name and choose “Create”.</FieldHint>
    </Field>
  );
}
