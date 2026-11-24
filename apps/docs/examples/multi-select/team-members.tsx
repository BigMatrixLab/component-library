'use client';

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

const members = [
  ['ada', 'Ada Lovelace'],
  ['grace', 'Grace Hopper'],
  ['katherine', 'Katherine Johnson'],
  ['margaret', 'Margaret Hamilton'],
  ['hedy', 'Hedy Lamarr'],
  ['radia', 'Radia Perlman'],
  ['annie', 'Annie Easley'],
  ['mae', 'Mae Jemison'],
] as const;

export default function MultiSelectTeamMembers() {
  return (
    <Field className="w-full max-w-md">
      <Label>Reviewers</Label>
      <MultiSelect name="reviewers" defaultValue={['ada', 'grace']}>
        <MultiSelectInput placeholder="Add reviewers" />
        <MultiSelectContent>
          {members.map(([id, name]) => (
            <MultiSelectItem key={id} value={id}>
              {name}
            </MultiSelectItem>
          ))}
          <MultiSelectEmpty>No teammates match your search.</MultiSelectEmpty>
        </MultiSelectContent>
      </MultiSelect>
      <FieldHint>Reviewers are notified when the pull request opens.</FieldHint>
    </Field>
  );
}
