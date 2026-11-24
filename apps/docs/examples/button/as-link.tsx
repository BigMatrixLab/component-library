import Link from 'next/link';
import { Button, Icon } from 'ui-kit';

export default function ButtonAsLink() {
  return (
    <Button asChild variant="outline">
      <Link href="/docs/components/dialog">
        Read the dialog docs
        <Icon name="arrow-up-right" />
      </Link>
    </Button>
  );
}
