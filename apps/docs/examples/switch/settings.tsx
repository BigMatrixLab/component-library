import { Switch } from 'ui-kit';

export default function SwitchSettings() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Switch
        labelPosition="start"
        label="Deploy notifications"
        description="Get an email when a deployment succeeds or fails."
        defaultChecked
      />
      <Switch labelPosition="start" label="Weekly digest" description="A summary of activity every Monday at 9 am." />
      <Switch labelPosition="start" label="Marketing emails" description="Product news and offers, at most once a month." />
    </div>
  );
}
