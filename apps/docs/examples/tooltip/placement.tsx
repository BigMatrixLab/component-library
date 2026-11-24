import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type Placement } from 'ui-kit';

const sides: { placement: Placement; label: string }[] = [
  { placement: 'top', label: 'Top' },
  { placement: 'right', label: 'Right' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'left', label: 'Left' },
];

export default function TooltipPlacement() {
  return (
    <TooltipProvider delayDuration={200}>
      {sides.map(({ placement, label }) => (
        <Tooltip key={placement}>
          <TooltipTrigger asChild>
            <Button variant="outline">{label}</Button>
          </TooltipTrigger>
          <TooltipContent placement={placement}>Opens on the {placement}</TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}
