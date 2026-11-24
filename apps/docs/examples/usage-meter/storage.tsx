import { UsageMeter } from 'ui-kit';

export default function UsageMeterStorage() {
  return (
    <div className="w-full max-w-sm">
      <UsageMeter label="Storage" value={7.2} max={10} unit="GB" description="Upgrade to Pro for 100 GB." />
    </div>
  );
}
