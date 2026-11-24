'use client';

import type { MouseEvent } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuLinkTitle,
  NavigationMenuList,
  NavigationMenuTrigger,
} from 'ui-kit';

const stop = (e: MouseEvent) => e.preventDefault();

export default function NavigationMenuAccordion() {
  return (
    <div className="mx-auto w-[20rem] max-w-full rounded-lg border border-border bg-background p-2">
      <NavigationMenu mode="accordion" aria-label="Mobile site menu" defaultValue="products">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="ui-nav-menu-grid">
                {[
                  ['Analytics', 'Dashboards your whole team understands.'],
                  ['Automations', 'Trigger workflows from any event.'],
                  ['Security', 'SSO, audit logs and role-based access.'],
                ].map(([title, description]) => (
                  <NavigationMenuLink key={title} href="#" onClick={stop}>
                    <NavigationMenuLinkTitle>{title}</NavigationMenuLinkTitle>
                    <NavigationMenuLinkDescription>{description}</NavigationMenuLinkDescription>
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="resources">
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="ui-nav-menu-grid">
                {[
                  ['Documentation', 'Guides and API reference.'],
                  ['Changelog', 'What shipped this week.'],
                ].map(([title, description]) => (
                  <NavigationMenuLink key={title} href="#" onClick={stop}>
                    <NavigationMenuLinkTitle>{title}</NavigationMenuLinkTitle>
                    <NavigationMenuLinkDescription>{description}</NavigationMenuLinkDescription>
                  </NavigationMenuLink>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" onClick={stop}>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
