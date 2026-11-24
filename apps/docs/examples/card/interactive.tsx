import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, Icon } from 'ui-kit';

const LINKS = [
  { href: '/docs/components/dialog', icon: 'layout-dashboard', title: 'Dialog', text: 'Modal surfaces for decisions.' },
  { href: '/docs/components/button', icon: 'zap', title: 'Button', text: 'A single action, in six variants.' },
] as const;

export default function CardInteractive() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      {LINKS.map((l) => (
        <Card key={l.href} variant="interactive" asChild>
          <Link href={l.href}>
            <CardHeader>
              <span className="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon name={l.icon} size={18} />
              </span>
              <CardTitle as="div" className="flex items-center gap-1">
                {l.title}
                <Icon name="arrow-up-right" className="text-muted-foreground" />
              </CardTitle>
              <CardDescription>{l.text}</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  );
}
