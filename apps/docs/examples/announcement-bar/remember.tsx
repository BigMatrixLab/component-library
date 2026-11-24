'use client';

import { useState } from 'react';
import { AnnouncementBar, AnnouncementBarLink, Button } from 'ui-kit';

const KEY = 'northwind-announcement-pricing-2026';

export default function AnnouncementBarRemember() {
  const [open, setOpen] = useState(true);

  return (
    <div className="grid w-full gap-4">
      <AnnouncementBar
        variant="primary"
        aria-label="Pricing update"
        storageKey={KEY}
        open={open}
        onOpenChange={setOpen}
        action={<AnnouncementBarLink href="#pricing">See what changes</AnnouncementBarLink>}
      >
        New pricing starts on 1 January. Your plan keeps its price for 12 months.
      </AnnouncementBar>
      <div className="flex items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">{open ? 'Dismiss it, then reload the page.' : 'Dismissed and remembered.'}</p>
        <Button
          size="sm"
          variant="outline"
          disabled={open}
          onClick={() => {
            try {
              localStorage.removeItem(KEY);
            } catch {}
            setOpen(true);
          }}
        >
          Show again
        </Button>
      </div>
    </div>
  );
}
