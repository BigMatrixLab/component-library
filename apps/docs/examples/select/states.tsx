'use client';

import { useState } from 'react';
import {
  Field,
  FieldError,
  FieldHint,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from 'ui-kit';

export default function SelectStates() {
  const [role, setRole] = useState('');
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Field required>
        <Label>Workspace role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger placeholder="Choose a role" />
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner" disabled>
              Owner (transfer ownership first)
            </SelectItem>
          </SelectContent>
        </Select>
        {role === '' ? <FieldError>Choose a role for this member.</FieldError> : <FieldHint>Role: {role}</FieldHint>}
      </Field>
      <Field disabled>
        <Label>Region</Label>
        <Select defaultValue="eu-west">
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="eu-west">EU West (Ireland)</SelectItem>
            <SelectItem value="us-east">US East (Virginia)</SelectItem>
          </SelectContent>
        </Select>
        <FieldHint>Fixed after the workspace is created.</FieldHint>
      </Field>
    </div>
  );
}
