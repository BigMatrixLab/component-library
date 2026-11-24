import { Button, Icon, Separator } from 'ui-kit';

export default function SeparatorLabel() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Button variant="outline">
        <Icon name="globe" />
        Continue with Google
      </Button>
      <Separator>or</Separator>
      <Button>
        <Icon name="mail" />
        Continue with email
      </Button>
    </div>
  );
}
