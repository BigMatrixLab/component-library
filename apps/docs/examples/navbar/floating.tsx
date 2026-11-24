'use client';

import { useState } from 'react';
import { Button, Icon, Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarNav } from 'ui-kit';

const links = ['Work', 'Studio', 'Journal'];

export default function NavbarFloating() {
  const [active, setActive] = useState('Work');
  return (
    <div className="h-[18rem] overflow-y-auto rounded-lg border border-border bg-muted/50">
      <Navbar variant="floating">
        <NavbarBrand href="#" onClick={(e) => e.preventDefault()}>
          <Icon name="sparkles" size={18} />
          Fieldwork
        </NavbarBrand>
        <NavbarNav>
          {links.map((label) => (
            <NavbarLink
              key={label}
              href="#"
              active={active === label}
              onClick={(e) => {
                e.preventDefault();
                setActive(label);
              }}
            >
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <Button size="sm">Book a call</Button>
        </NavbarActions>
      </Navbar>
      <div className="space-y-3 p-6">
        {['Brand system for Orbit Bank', 'Packaging for Kettle & Co', 'Wayfinding for Elm Street Library', 'Annual report, Halden Trust'].map((t) => (
          <div key={t} className="rounded-lg border border-border bg-background p-4 text-sm">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
