import { Field, FieldHint, Label, TagInput } from 'ui-kit';

const SKILLS = [
  'Accessibility',
  'Design systems',
  'Figma',
  'GraphQL',
  'Next.js',
  'Node.js',
  'PostgreSQL',
  'React',
  'TypeScript',
  'User research',
];

export default function TagInputSkills() {
  return (
    <div className="w-full max-w-md">
      <Field>
        <Label>Skills</Label>
        <TagInput defaultValue={['React', 'TypeScript']} suggestions={SKILLS} placeholder="Add a skill" size="lg" />
        <FieldHint>Start typing, or press the down arrow to browse suggestions.</FieldHint>
      </Field>
    </div>
  );
}
