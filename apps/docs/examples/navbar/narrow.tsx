'use client';

import { useState } from 'react';
import {
  Button,
  Icon,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarMobileMenu,
  NavbarMobileToggle,
  NavbarNav,
} from 'ui-kit';

const links = ['Features', 'Pricing', 'Changelog'];

export default function NavbarNarrow() {
  const [active, setActive] = useState('Features');
  const items = links.map((label) => (
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
  ));
  return (
    <div className="mx-auto h-48 w-[22rem] max-w-full overflow-hidden rounded-lg border border-border bg-background">
      <Navbar routeKey={active}>
        <NavbarBrand href="#" onClick={(e) => e.preventDefault()}>
          <Icon name="zap" size={18} />
          Lumen
        </NavbarBrand>
        <NavbarNav>{items}</NavbarNav>
        <NavbarActions>
          <NavbarMobileToggle />
        </NavbarActions>
        <NavbarMobileMenu title="Lumen">
          {items}
          <Button className="mt-3">Start free trial</Button>
        </NavbarMobileMenu>
      </Navbar>
      <p className="p-4 text-sm text-muted-foreground">Narrower than 768px, the links move into the menu.</p>
    </div>
  );
}
