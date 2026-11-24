import { Switch } from 'ui-kit';

export default function SwitchSizes() {
  return (
    <div className="grid gap-4">
      <Switch size="sm" label="Small, 32 × 18" defaultChecked />
      <Switch label="Medium, 40 × 24" defaultChecked />
    </div>
  );
}
