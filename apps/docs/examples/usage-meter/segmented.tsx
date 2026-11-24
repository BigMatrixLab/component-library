import { UsageMeter } from 'ui-kit';

export default function UsageMeterSegmented() {
  return (
    <div className="w-full max-w-md">
      <UsageMeter
        label="Drive storage"
        max={15}
        unit="GB"
        size="lg"
        segments={[
          { label: 'Photos', value: 3.4 },
          { label: 'Videos', value: 2.9 },
          { label: 'Documents', value: 1.5 },
          { label: 'Mail', value: 0.8 },
        ]}
      />
    </div>
  );
}
