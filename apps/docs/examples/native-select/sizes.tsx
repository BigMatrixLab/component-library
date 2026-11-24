import { NativeSelect } from 'ui-kit';

export default function NativeSelectSizes() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <NativeSelect size="sm" aria-label="Small billing period">
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Yearly</option>
      </NativeSelect>
      <NativeSelect aria-label="Default billing period">
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Yearly</option>
      </NativeSelect>
      <NativeSelect size="lg" aria-label="Large billing period">
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Yearly</option>
      </NativeSelect>
    </div>
  );
}
