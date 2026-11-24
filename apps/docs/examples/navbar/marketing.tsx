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

const links = ['Product', 'Pricing', 'Customers', 'Docs'];
const posts = [
  ['Ship updates in one place', 'Changelogs, release notes and roadmaps that stay in sync with your repo.'],
  ['Review without the meeting', 'Comment on any build and approve from your phone in under a minute.'],
  ['Usage-based pricing, explained', 'What a typical team of 12 pays, with the maths shown line by line.'],
  ['How Northwind cut onboarding by 40%', 'A guided checklist replaced three kick-off calls for every new customer.'],
];

export default function NavbarMarketing() {
  const [active, setActive] = useState('Product');
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
    <div className="h-[24rem] overflow-y-auto rounded-lg border border-border bg-background">
      <Navbar routeKey={active}>
        <NavbarBrand href="#" onClick={(e) => e.preventDefault()}>
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Icon name="zap" size={16} />
          </span>
          Lumen
        </NavbarBrand>
        <NavbarNav>{items}</NavbarNav>
        <NavbarActions>
          <Button variant="ghost" size="sm" className="ui-navbar-hide-narrow">
            Sign in
          </Button>
          <Button size="sm">Start free trial</Button>
          <NavbarMobileToggle />
        </NavbarActions>
        <NavbarMobileMenu title="Lumen">
          {items}
          <Button className="mt-3">Start free trial</Button>
        </NavbarMobileMenu>
      </Navbar>

      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {posts.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-border p-4">
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </article>
        ))}
        {posts.map(([title, body]) => (
          <article key={`${title}-2`} className="rounded-lg border border-border p-4">
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
