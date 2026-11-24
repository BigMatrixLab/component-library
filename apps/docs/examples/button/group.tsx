import { Button, ButtonGroup, Icon } from 'ui-kit';

export default function ButtonGroupExample() {
  return (
    <>
      <ButtonGroup aria-label="Range">
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Merge">
        <Button>Merge pull request</Button>
        <Button icon aria-label="More merge options">
          <Icon name="chevron-down" />
        </Button>
      </ButtonGroup>
    </>
  );
}
