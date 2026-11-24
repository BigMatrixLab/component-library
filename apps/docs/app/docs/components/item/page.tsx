import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ItemSettings from '@/examples/item/settings';
import ItemVariants from '@/examples/item/variants';
import ItemLinks from '@/examples/item/links';

export const metadata: Metadata = { title: 'Item & list' };

export default function ItemPage() {
  return (
    <DocPage href="/docs/components/item">
      <Section id="settings" title="Settings list">
        <P>A row is media, text, then actions. <Code>ItemGroup</Code> stacks rows with hairline dividers and, with <Code>variant=&quot;outline&quot;</Code>, wraps them in one bordered container.</P>
        <Example component="item" file="item/settings" title="Settings list" align="stretch" minHeight={420}>
          <ItemSettings />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Lists of things with a title and a line of detail: settings, files, people, search results.',
            'Rows that carry their own controls (a switch, a button, a menu).',
          ]}
        />
        <P>Not for tabular data with sortable columns (use a table) or for navigation menus (use a menu or sidebar).</P>
      </Section>

      <Section id="variants" title="Variants and sizes">
        <P>
          <Code>default</Code> has no container, <Code>outline</Code> a border, <Code>muted</Code> a filled well. Sizes <Code>sm</Code>, <Code>md</Code> and <Code>lg</Code> change padding and text.
        </P>
        <Example component="item" file="item/variants" title="Variants and sizes" align="stretch" minHeight={420}>
          <ItemVariants />
        </Example>
      </Section>

      <Section id="links" title="As links">
        <P>
          <Code>asChild</Code> renders your link (here a Next.js <Code>Link</Code>) with the row’s styles. Links and buttons get a hover fill and a focus ring; a plain row stays static.
        </P>
        <Example component="item" file="item/links" title="As links" align="stretch" minHeight={300}>
          <ItemLinks />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Item"
          rows={[
            { name: 'variant', type: "'default' | 'outline' | 'muted'", default: "'default'", description: 'No container, a border, or a filled well.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding and text size.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child (a link or button) with the row styles.' },
          ]}
        />
        <PropsTable
          title="ItemMedia"
          rows={[{ name: 'variant', type: "'default' | 'icon' | 'image'", default: "'default'", description: 'As is (an Avatar), an Icon in a soft tile, or a rounded thumbnail.' }]}
        />
        <PropsTable
          title="ItemGroup"
          rows={[
            { name: 'variant', type: "'default' | 'outline' | 'muted'", default: "'default'", description: 'Draw the whole group as one container.' },
            { name: 'divided', type: 'boolean', default: 'true', description: 'Hairlines between rows.' },
          ]}
        />
        <P>
          <Code>ItemContent</Code> holds <Code>ItemTitle</Code> and <Code>ItemDescription</Code> (truncated to two lines); <Code>ItemMeta</Code> is quiet trailing text; <Code>ItemActions</Code> holds controls. All forward <Code>ref</Code> and <Code>className</Code> and are Server Component–safe.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'ItemGroup is role="list"; it wraps each child in a role="listitem" cell, so a link row (asChild) keeps its own link role.',
            'Give a group an aria-label when its purpose is not clear from the heading above it.',
            'Rows with several controls: give each control its own accessible name (aria-label on a switch, specific button text).',
            'Do not nest interactive controls inside a row that is itself a link.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={['Hover fill and focus ring change colour only, in 150ms, on fine pointers.', 'Reduced motion: unchanged (nothing moves).']}
        />
      </Section>
    </DocPage>
  );
}
