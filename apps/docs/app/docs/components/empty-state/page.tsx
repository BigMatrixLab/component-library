import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import EmptyNoProjects from '@/examples/empty-state/no-projects';
import EmptyVariants from '@/examples/empty-state/variants';
import EmptyInCard from '@/examples/empty-state/in-card';

export const metadata: Metadata = { title: 'Empty state' };

export default function EmptyStatePage() {
  return (
    <DocPage href="/docs/components/empty-state">
      <Section id="first-use" title="No projects yet">
        <P>Say what is missing, why it matters and the one thing to do about it. The icon sits in a soft tile so the screen stays calm.</P>
        <Example component="empty-state" file="empty-state/no-projects" title="No projects yet" minHeight={320}>
          <EmptyNoProjects />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'First use: a list, table or dashboard that has no data yet.',
            'Zero results: a search or filter that matched nothing (offer a way to clear it).',
            'Cleared states: an inbox at zero, a finished queue.',
          ]}
        />
        <P>Not for errors (use an alert or an error page) or for content that is still loading (use a skeleton).</P>
      </Section>

      <Section id="variants" title="Variants">
        <P>
          <Code>default</Code> has no container, so it fits inside a card or table body. <Code>dashed</Code> outlines the area when it is itself the target (drop zones, “add the first…”). <Code>card</Code> gives it a bordered surface of its own.
        </P>
        <Example component="empty-state" file="empty-state/variants" title="Variants" align="stretch">
          <EmptyVariants />
        </Example>
      </Section>

      <Section id="in-card" title="Inside a card">
        <P>Put a default <Code>Empty</Code> in <Code>CardContent</Code>. The card keeps its header, so people still know where they are.</P>
        <Example component="empty-state" file="empty-state/in-card" title="Inside a card" minHeight={360}>
          <EmptyInCard />
        </Example>
      </Section>

      <Section id="media" title="Media">
        <P>
          <Code>EmptyMedia</Code> defaults to the <Code>icon</Code> variant: any <Code>Icon</Code> in a 48px tile. Use <Code>variant=&quot;illustration&quot;</Code> for an image or SVG (up to 12rem wide) instead.
        </P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Empty"
          rows={[
            { name: 'variant', type: "'default' | 'dashed' | 'card'", default: "'default'", description: 'No container, a dashed outline, or a bordered surface.' },
            { name: '...props', type: 'HTMLAttributes<div>', description: 'Forwarded, including ref and className.' },
          ]}
        />
        <PropsTable
          title="EmptyMedia"
          rows={[{ name: 'variant', type: "'icon' | 'illustration'", default: "'icon'", description: 'An icon in a soft tile, or a free slot for an image or SVG.' }]}
        />
        <PropsTable
          title="EmptyTitle"
          rows={[{ name: 'as', type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'", default: "'h3'", description: 'Heading level that fits the page outline.' }]}
        />
        <P>
          <Code>EmptyHeader</Code> groups media, title and description; <Code>EmptyDescription</Code> is a paragraph; <Code>EmptyActions</Code> wraps the buttons. All forward <Code>ref</Code> and <Code>className</Code>. Every part is Server Component–safe.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Plain text and headings: nothing is announced on its own, so a screen reader meets it in reading order.',
            'The icon tile is decorative (the built-in icons are aria-hidden); the title carries the meaning.',
            'Pick the title level that fits the page outline, or as="div" when no heading is wanted.',
            'Text and the muted description meet 4.5:1 contrast in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'One soft rise on mount (8px, a 4px blur that clears, under 400ms).',
            'Reduced motion: it simply appears.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
