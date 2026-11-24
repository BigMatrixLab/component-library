import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SkeletonShapes from '@/examples/skeleton/shapes';
import SkeletonProfile from '@/examples/skeleton/profile';
import SkeletonTable from '@/examples/skeleton/table';

export const metadata: Metadata = { title: 'Skeleton' };

export default function SkeletonPage() {
  return (
    <DocPage href="/docs/components/skeleton">
      <Section id="shapes" title="Shapes">
        <P>
          Three shapes: a text line (16px), a circle for avatars and a block for images. A faint highlight sweeps across; in dark mode it is a lighter band, not a darker one.
        </P>
        <Example component="skeleton" file="skeleton/shapes" title="Skeleton shapes">
          <SkeletonShapes />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Content takes longer than about a second to arrive and you know its shape: a profile, a card, table rows.',
            'To reserve space, so the page does not jump when the real content replaces it.',
          ]}
        />
        <P>Not for: waits under a second (show nothing), unknown shapes (use a spinner) or measurable work (use progress).</P>
      </Section>

      <Section id="profile" title="Profile and card">
        <P>Match the real layout: the same avatar size, the same number of lines. Toggle to see that nothing moves.</P>
        <Example component="skeleton" file="skeleton/profile" title="Profile skeleton">
          <SkeletonProfile />
        </Example>
      </Section>

      <Section id="table" title="Table rows">
        <P>Vary the line widths a little so the rows do not look like a barcode.</P>
        <Example component="skeleton" file="skeleton/table" title="Table skeleton">
          <SkeletonTable />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Skeleton"
          rows={[
            { name: 'shape', type: "'line' | 'circle' | 'block'", default: "'line'", description: 'Text line, avatar circle or image block.' },
            { name: 'width', type: 'number | string', description: 'Number = px, string = any CSS length. A circle is 40px by default and as tall as it is wide.' },
            { name: 'height', type: 'number | string', description: 'Lines are 16px and blocks 96px by default.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded, including ref, className and style.' },
          ]}
        />
        <P>
          Size anything with <Code>className</Code> too: <Code>{'<Skeleton className="h-4 w-40" />'}</Code>.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Skeletons are aria-hidden: they have no content to announce.',
            'Mark the loading region aria-busy="true" and include a visually hidden role="status" message (“Loading profile”), so the wait is announced once.',
            'Remove aria-busy and the status when the content arrives.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'A 1.6s linear shimmer (--animate-shimmer) that only moves a gradient behind the shape.',
            'Reduced motion: no shimmer; the placeholder is a still, faint fill.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
