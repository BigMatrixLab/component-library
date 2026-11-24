import { ProgressCircle } from 'ui-kit';

export default function ProgressCircular() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <ProgressCircle aria-label="Profile completeness" size="sm" value={35} />
      <ProgressCircle aria-label="Storage used" value={62} />
      <ProgressCircle aria-label="Seats used" size="lg" value={92} tone="warning" />
      <ProgressCircle aria-label="Onboarding" size="xl" value={100} tone="success">
        <span className="text-center text-sm leading-tight">
          <span className="block text-xl font-semibold">8/8</span>
          <span className="text-muted-foreground">steps</span>
        </span>
      </ProgressCircle>
    </div>
  );
}
