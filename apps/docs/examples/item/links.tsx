import Link from 'next/link';
import { Icon, Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from 'ui-kit';

const pages = [
  { href: '/docs/components/card', icon: 'layout-dashboard', title: 'Card', description: 'A contained group of content and actions.' },
  { href: '/docs/components/timeline', icon: 'activity', title: 'Timeline', description: 'What happened, newest first.' },
  { href: '/docs/components/carousel', icon: 'image', title: 'Carousel', description: 'Browse slides by swipe, arrows or dots.' },
] as const;

export default function ItemLinks() {
  return (
    <ItemGroup className="w-full max-w-xl" aria-label="Related components">
      {pages.map((p) => (
        <Item key={p.href} asChild>
          <Link href={p.href}>
            <ItemMedia variant="icon">
              <Icon name={p.icon} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{p.title}</ItemTitle>
              <ItemDescription>{p.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Icon name="chevron-right" className="text-muted-foreground" />
            </ItemActions>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  );
}
