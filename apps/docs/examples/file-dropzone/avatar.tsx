import { Field, FieldHint, FileDropzone, Label } from 'ui-kit';

export default function FileDropzoneAvatar() {
  return (
    <div className="w-full max-w-md">
      <Field>
        <Label>Profile photo</Label>
        <FileDropzone accept="image/*" maxSize={2 * 1024 * 1024} variant="compact" icon="image" />
        <FieldHint>A square photo works best. Choosing a new one replaces the old.</FieldHint>
      </Field>
    </div>
  );
}
