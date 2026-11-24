import { Alert, AlertDescription, AlertTitle } from 'ui-kit';

export default function AlertBanner() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <Alert variant="info" banner>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Sunday 02:00 to 03:00 UTC. Exports may be unavailable.</AlertDescription>
      </Alert>
      <div className="p-6 text-sm text-muted-foreground">Page content continues below the banner.</div>
    </div>
  );
}
