import { Field, FieldError, FieldHint, Label, Textarea } from 'ui-kit';

export default function TextareaStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Field required invalid>
        <Label>Reason for refund</Label>
        <Textarea rows={2} placeholder="What went wrong?" />
        <FieldError>Tell us why so we can improve.</FieldError>
      </Field>
      <Field disabled>
        <Label>Internal comment</Label>
        <Textarea rows={2} defaultValue="Locked while the invoice is being reviewed." />
      </Field>
      <Field>
        <Label>Shipping instructions</Label>
        <Textarea size="lg" rows={2} defaultValue="Leave with the front desk." />
        <FieldHint>Large size.</FieldHint>
      </Field>
      <Field>
        <Label>Audit log entry</Label>
        <Textarea rows={2} readOnly defaultValue="Plan changed from Starter to Team on 12 March." />
      </Field>
    </div>
  );
}
