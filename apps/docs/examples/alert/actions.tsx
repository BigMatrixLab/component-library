import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from 'ui-kit';

export default function AlertActionsExample() {
  return (
    <Alert variant="warning" className="max-w-xl">
      <AlertTitle>Your trial ends in 3 days</AlertTitle>
      <AlertDescription>Add a payment method to keep your 12 projects and 4 team members.</AlertDescription>
      <AlertActions>
        <Button size="sm">Add payment method</Button>
        <Button size="sm" variant="ghost">
          Remind me later
        </Button>
      </AlertActions>
    </Alert>
  );
}
