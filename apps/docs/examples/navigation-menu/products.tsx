'use client';

import type { CSSProperties, MouseEvent } from 'react';
import {
  Icon,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuLinkTitle,
  NavigationMenuList,
  NavigationMenuTrigger,
  type IconName,
} from 'ui-kit';

const products: { title: string; description: string; icon: IconName }[] = [
  { title: 'Analytics', description: 'Dashboards your whole team understands.', icon: 'bar-chart' },
  { title: 'Automations', description: 'Trigger workflows from any event.', icon: 'zap' },
  { title: 'Collaboration', description: 'Comment, assign and review in one place.', icon: 'users' },
  { title: 'Security', description: 'SSO, audit logs and role-based access.', icon: 'lock' },
];
const resources = [
  { title: 'Documentation', description: 'Guides and API reference.' },
  { title: 'Changelog', description: 'What shipped this week.' },
  { title: 'Community', description: '12,000 builders on Discord.' },
];

const stop = (e: MouseEvent) => e.preventDefault();

export default function NavigationMenuProducts() {
  return (
    <div className="flex min-h-[22rem] justify-center rounded-lg border border-border bg-background p-3 pt-4">
      <NavigationMenu aria-label="Site">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="ui-nav-menu-grid" style={{ '--ui-nav-cols': 2, '--ui-nav-width': '35rem' } as CSSProperties}>
                {products.map(({ title, description, icon }) => (
                  <NavigationMenuLink key={title} href="#" onClick={stop}>
                    <span className="mb-1 grid size-8 place-items-center rounded-md bg-muted text-foreground">
                      <Icon name={icon} size={16} />
                    </span>
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
              <div className="ui-nav-menu-grid" style={{ '--ui-nav-width': '19rem' } as CSSProperties}>
                {resources.map(({ title, description }) => (
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
