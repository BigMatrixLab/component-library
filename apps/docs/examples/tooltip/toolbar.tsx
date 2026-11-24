import { Button, Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type IconName } from 'ui-kit';

const actions: { icon: IconName; label: string; shortcut: string }[] = [
  { icon: 'copy', label: 'Copy link', shortcut: '⌘L' },
  { icon: 'download', label: 'Download', shortcut: '⌘D' },
  { icon: 'star', label: 'Add to favourites', shortcut: '⌘S' },
  { icon: 'pencil', label: 'Rename', shortcut: 'F2' },
  { icon: 'trash', label: 'Move to trash', shortcut: '⌫' },
];

export default function TooltipToolbar() {
  return (
    <TooltipProvider>
      <div role="toolbar" aria-label="File actions" className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {actions.map(({ icon, label, shortcut }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" icon aria-label={label}>
                <Icon name={icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent shortcut={shortcut}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
