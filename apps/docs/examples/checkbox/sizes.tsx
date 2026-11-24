import { Checkbox } from 'ui-kit';

export default function CheckboxSizes() {
  return (
    <div className="grid gap-4">
      <Checkbox size="sm" label="Small, 16px" defaultChecked />
      <Checkbox label="Medium, 20px" defaultChecked />
      <Checkbox size="lg" label="Large, 24px" defaultChecked />
    </div>
  );
}
