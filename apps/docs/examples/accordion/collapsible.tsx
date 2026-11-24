'use client';

import { useState } from 'react';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Icon } from 'ui-kit';

const files = ['package.json', 'tsconfig.json', 'next.config.ts', 'tailwind.config.ts', '.env.example', 'README.md'];

export default function AccordionCollapsible() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Changed files</p>
          <p className="text-sm text-muted-foreground">6 files in this commit</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {open ? 'Show less' : 'Show all'}
            <Icon name={open ? 'chevron-up' : 'chevron-down'} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <p className="mt-3 rounded-md bg-muted px-3 py-2 font-mono text-sm">{files[0]}</p>
      <CollapsibleContent>
        <ul className="grid gap-2 pt-2">
          {files.slice(1).map((f) => (
            <li key={f} className="rounded-md bg-muted px-3 py-2 font-mono text-sm">
              {f}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
