'use client';

import { useState } from 'react';
import { Field, Icon, Input, InputAction, InputAddon, InputGroup, InputIcon, Label } from 'ui-kit';

export default function InputGroupExample() {
  const [query, setQuery] = useState('quarterly invoices');

  return (
    <div className="grid w-full max-w-sm gap-5">
      <Field>
        <Label>Search</Label>
        <InputGroup>
          <InputIcon>
            <Icon name="search" />
          </InputIcon>
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" />
          <InputAction aria-label="Clear search" hidden={query === ''} onClick={() => setQuery('')}>
            <Icon name="x" />
          </InputAction>
        </InputGroup>
      </Field>
      <Field>
        <Label>Website</Label>
        <InputGroup>
          <InputAddon>https://</InputAddon>
          <Input placeholder="northwind" inputMode="url" />
          <InputAddon>.com</InputAddon>
        </InputGroup>
      </Field>
      <Field>
        <Label>Amount</Label>
        <InputGroup>
          <InputIcon>
            <Icon name="dollar-sign" />
          </InputIcon>
          <Input inputMode="decimal" defaultValue="1,240.00" className="tabular-nums" />
          <InputAddon>USD</InputAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
