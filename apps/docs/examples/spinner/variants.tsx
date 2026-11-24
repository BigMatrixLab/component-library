import { Spinner } from 'ui-kit';

export default function SpinnerVariants() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Spinner key={size} size={size} label={`Loading, ${size}`} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Spinner key={size} variant="dots" size={size} label={`Loading dots, ${size}`} />
        ))}
      </div>
    </div>
  );
}
