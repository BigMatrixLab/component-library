import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from 'ui-kit';

export default function DropdownMenuRowActions() {
  return (
    <div className="flex w-full max-w-sm items-center justify-between rounded-lg border border-border bg-card py-2 pl-4 pr-2">
      <div className="grid">
        <span className="font-medium">Q3 roadmap.pdf</span>
        <span className="text-sm text-muted-foreground">2.4 MB · edited 3 days ago</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" icon aria-label="Actions for Q3 roadmap.pdf">
            <Icon name="more-horizontal" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottom-end" className="w-48">
          <DropdownMenuItem icon={<Icon name="pencil" />}>Rename</DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="copy" />}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="download" />} disabled>
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<Icon name="trash" />} variant="destructive">
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
