import { Button, Popover, PopoverContent, PopoverTrigger, type Placement } from 'ui-kit';

const sides: { placement: Placement; label: string }[] = [
  { placement: 'top', label: 'Top' },
  { placement: 'right', label: 'Right' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'left', label: 'Left' },
];

export default function PopoverPlacement() {
  return (
    <>
      {sides.map(({ placement, label }) => (
        <Popover key={placement}>
          <PopoverTrigger asChild>
            <Button variant="outline">{label}</Button>
          </PopoverTrigger>
          <PopoverContent placement={placement} arrow className="w-64">
            <p className="font-medium">Billing cycle</p>
            <p className="mt-1 text-muted-foreground">Your next invoice of $48.00 is created on 1 December.</p>
          </PopoverContent>
        </Popover>
      ))}
    </>
  );
}
