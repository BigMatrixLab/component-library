import { Spinner } from 'ui-kit';

export default function SpinnerInContext() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" label="Syncing" />
        Syncing 24 files to Atlas…
      </p>
      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
        <Spinner variant="dots" size="sm" label={false} />
        <span>Maya is typing</span>
      </div>
      <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        <Spinner size="lg" label={false} className="text-foreground" />
        Loading your dashboard
      </div>
    </div>
  );
}
