'use client';

import { useState } from 'react';
import { Button, Icon, Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarNav } from 'ui-kit';

const links = ['Overview', 'Deployments', 'Logs', 'Settings'];

export default function NavbarUnderline() {
  const [active, setActive] = useState('Deployments');
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <Navbar>
        <NavbarBrand href="#" onClick={(e) => e.preventDefault()}>
          <Icon name="layout-dashboard" size={18} />
          Harbor
        </NavbarBrand>
        <NavbarNav indicator="underline" aria-label="Project">
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
          <Button variant="outline" size="sm">
            <Icon name="external-link" />
            Visit site
          </Button>
        </NavbarActions>
      </Navbar>
      <p className="p-6 text-sm text-muted-foreground">Deployments · 14 in the last 7 days, 0 failed.</p>
    </div>
  );
}
