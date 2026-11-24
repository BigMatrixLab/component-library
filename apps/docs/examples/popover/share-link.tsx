'use client';

import { useState } from 'react';
import { Button, Icon, Popover, PopoverContent, PopoverTrigger } from 'ui-kit';

const link = 'https://atlas.example.com/s/q3-roadmap';

export default function PopoverShareLink() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Popover onOpenChange={(open) => open || setCopied(false)}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Icon name="link" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent placement="bottom-start" className="w-80">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <h3 className="text-md font-semibold">Share “Q3 roadmap”</h3>
            <p className="text-muted-foreground">Anyone with the link can view. 12 people have opened it.</p>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              aria-label="Share link"
              value={link}
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring"
            />
            <Button size="md" variant="outline" icon aria-label={copied ? 'Copied' : 'Copy link'} onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
