import Link from 'next/link';
import { Button, Icon } from 'ui-kit';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-24">
      <div className="ui-stagger">
        <p className="text-sm text-muted-foreground">ui-kit · Phase 0</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Our components. No one else’s.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          A calm React component library with our own motion, charts and themes — and a verified AI prompt for every piece.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/docs/components/button">
              Browse components
              <Icon name="arrow-right" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
