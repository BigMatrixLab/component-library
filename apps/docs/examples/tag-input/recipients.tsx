'use client';

import { useState } from 'react';
import { Field, FieldHint, Label, TagInput } from 'ui-kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TagInputRecipients() {
  const [recipients, setRecipients] = useState<string[]>(['ada@northwind.com', 'grace@northwind.com']);

  return (
    <div className="w-full max-w-md">
      <Field>
        <Label>Send the invoice to</Label>
        <TagInput
          value={recipients}
          onValueChange={setRecipients}
          maxTags={5}
          validate={(tag) => EMAIL.test(tag) || `${tag} is not a valid email address`}
          placeholder="name@company.com"
          inputMode="email"
          name="recipients"
        />
        <FieldHint>Press Enter, comma or Tab to add. Paste a list to add several. {recipients.length} of 5 added.</FieldHint>
      </Field>
    </div>
  );
}
