import { Button, Icon } from 'ui-kit';

export default function ButtonWithIcons() {
  return (
    <>
      <Button>
        <Icon name="plus" />
        Add item
      </Button>
      <Button variant="outline">
        Continue
        <Icon name="arrow-right" />
      </Button>
      <Button variant="outline" icon aria-label="Settings">
        <Icon name="settings" />
      </Button>
      <Button variant="ghost" size="sm" icon aria-label="More actions">
        <Icon name="more-horizontal" />
      </Button>
    </>
  );
}
