import { Alert, AlertDescription, AlertTitle } from 'ui-kit';

export default function AlertVariants() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert icon={false}>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your workspace has 3 pending invitations.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>New billing cycle</AlertTitle>
        <AlertDescription>Invoices are now issued on the 1st of each month.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Domain verified</AlertTitle>
        <AlertDescription>northwind.example is ready to send email.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You have used 9.2 GB of your 10 GB plan.</AlertDescription>
      </Alert>
      <Alert variant="destructive" role="alert">
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>The card ending 4242 was declined. Update it to keep your subscription active.</AlertDescription>
      </Alert>
    </div>
  );
}
