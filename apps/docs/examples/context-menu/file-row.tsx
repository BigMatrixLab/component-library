'use client';

import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
  Icon,
} from 'ui-kit';

const FILES = [
  { name: 'Quarterly report.pdf', size: '2.4 MB', modified: 'Edited 2 days ago' },
  { name: 'Brand guidelines.fig', size: '18.7 MB', modified: 'Edited 3 weeks ago' },
  { name: 'Invoice 0042.pdf', size: '184 KB', modified: 'Edited 1 November' },
];

function FileRow({ name, size, modified, onAction }: (typeof FILES)[number] & { onAction: (text: string) => void }) {
  const [starred, setStarred] = useState(false);
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <Icon name="file" className="shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">
            {size} · {modified}
          </p>
        </div>
        {starred && <Icon name="star" className="shrink-0 text-muted-foreground" label="Starred" />}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem icon={<Icon name="external-link" />} shortcut="⌘O" onSelect={() => onAction(`Opened ${name}`)}>
          Open
        </ContextMenuItem>
        <ContextMenuItem icon={<Icon name="pencil" />} shortcut="F2" onSelect={() => onAction(`Renaming ${name}`)}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem icon={<Icon name="copy" />} shortcut="⌘D" onSelect={() => onAction(`Duplicated ${name}`)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<Icon name="link" />}>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onSelect={() => onAction('Link copied')}>Copy link</ContextMenuItem>
            <ContextMenuItem onSelect={() => onAction('Email draft opened')}>Send by email…</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuCheckboxItem checked={starred} onCheckedChange={setStarred}>
          Starred
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<Icon name="trash" />}
          variant="destructive"
          shortcut="⌫"
          onSelect={() => onAction(`Moved ${name} to trash`)}
        >
          Move to trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function ContextMenuFileRow() {
  const [last, setLast] = useState('Right-click a file (long-press on touch)');
  return (
    <div className="grid w-full max-w-md gap-2">
      {FILES.map((file) => (
        <FileRow key={file.name} {...file} onAction={setLast} />
      ))}
      <p role="status" className="px-1 pt-1 text-sm text-muted-foreground">
        {last}
      </p>
    </div>
  );
}
