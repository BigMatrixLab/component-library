import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CardBasic from '@/examples/card/basic';
import CardInteractive from '@/examples/card/interactive';
import CardVariants from '@/examples/card/variants';

export const metadata: Metadata = { title: 'Card' };

export default function CardPage() {
  return (
    <DocPage href="/docs/components/card">
      <Section id="basic" title="Anatomy">
        <P>
          A card rests on a 1px border with no shadow. <Code>CardHeader</Code> holds the title and description, plus a <Code>CardAction</Code> in the top-right corner. Content and footer follow, spaced by 16px.
        </P>
        <Example component="card" file="card/basic" title="Card">
          <CardBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Group related content and its actions into one scannable unit: a plan, a project, a setting.',
            'A grid of links to other pages: use the interactive variant.',
          ]}
        />
        <P>Not for: every block on a page (use spacing and headings), or content that needs to float above the page (use a popover or dialog; those get shadows).</P>
      </Section>

      <Section id="interactive" title="Interactive">
        <P>
          <Code>variant=&quot;interactive&quot;</Code> with <Code>asChild</Code> turns the card into a link. On hover it lifts 2px and the border strengthens; there is still no shadow. Make the whole card the link so there is one big target.
        </P>
        <Example component="card" file="card/interactive" title="Interactive cards">
          <CardInteractive />
        </Example>
      </Section>

      <Section id="variants" title="Variants and concentric radii">
        <P>
          A nested corner is the outer radius minus the gap between them. The <Code>inset</Code> variant does this for an 8px gap (<Code>--ui-card-gap</Code>).
        </P>
        <Example component="card" file="card/variants" title="Card variants">
          <CardVariants />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Card"
          rows={[
            { name: 'variant', type: "'default' | 'interactive' | 'muted' | 'inset'", default: "'default'", description: 'Border and fill treatment.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child (e.g. a Next.js Link) with card styles.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded, including ref and className.' },
          ]}
        />
        <PropsTable
          title="CardTitle"
          rows={[{ name: 'as', type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'", default: "'h3'", description: 'Heading level. Use div when the card is a link.' }]}
        />
        <P>
          <Code>CardHeader</Code>, <Code>CardDescription</Code>, <Code>CardAction</Code>, <Code>CardContent</Code> and <Code>CardFooter</Code> take native props and forward <Code>ref</Code>. All of it is Server Component–safe.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A card has no role of its own; it is a container. Choose the CardTitle heading level that fits the page outline.',
            'An interactive card is one link: its accessible name is the text inside. Do not nest buttons or links in it.',
            'Keyboard focus shows a 3px ring and a stronger border.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Hover lift (2px) on the smooth spring, only on devices with a fine pointer; press scales to .985.',
            'Reduced motion: no lift or press scale; the border colour still changes.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
