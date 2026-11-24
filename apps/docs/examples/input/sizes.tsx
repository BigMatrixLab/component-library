import { Input } from 'ui-kit';

export default function InputSizes() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input size="sm" placeholder="Small, 32px" aria-label="Small input" />
      <Input placeholder="Default, 36px" aria-label="Default input" />
      <Input size="lg" placeholder="Large, 44px" aria-label="Large input" />
    </div>
  );
}
