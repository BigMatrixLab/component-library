'use client';

import { useState } from 'react';
import { Button, Icon, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, type IconName } from 'ui-kit';

const links: { label: string; icon: IconName }[] = [
  { label: 'Overview', icon: 'layout-dashboard' },
  { label: 'Deployments', icon: 'activity' },
  { label: 'Domains', icon: 'globe' },
  { label: 'Team', icon: 'users' },
  { label: 'Billing', icon: 'credit-card' },
  { label: 'Settings', icon: 'settings' },
];

export default function SheetMobileNav() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('Overview');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" icon aria-label="Open menu">
          <Icon name="menu" size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" size="sm" mobileFull>
        <SheetHeader>
          <SheetTitle>Atlas</SheetTitle>
        </SheetHeader>
        <nav aria-label="Main" className="grid gap-0.5 px-3 pb-4">
          {links.map(({ label, icon }) => (
            <a
              key={label}
              href="#"
              aria-current={current === label ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(label);
                setOpen(false);
              }}
              className="flex h-11 items-center gap-3 rounded-md px-3 text-base font-medium text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
            >
              <Icon name={icon} size={18} />
              {label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
