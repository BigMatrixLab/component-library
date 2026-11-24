import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import InvoicesTable from '@/examples/table/invoices';
import TableVariants from '@/examples/table/variants';

export const metadata: Metadata = { title: 'Table' };

export default function TablePage() {
  return (
    <DocPage href="/docs/components/table">
      <Section id="invoices" title="Invoices">
        <P>A native table with a calm header, hairline rows and right-aligned, tabular figures. It is a Server Component, so it adds no JavaScript.</P>
        <Example component="table" file="table/invoices" title="Invoices table" align="stretch">
          <InvoicesTable />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Comparing the same attributes across many records: invoices, members, deployments.',
            <>Need sorting, search, selection or pagination? Use <Code>DataTable</Code>, which is built on this.</>,
          ]}
        />
        <P>Not for layout, and not for a handful of key / value pairs (use a description list).</P>
      </Section>

      <Section id="variants" title="Variants">
        <P>
          <Code>compact</Code> tightens rows to 36px, <Code>striped</Code> tints alternate rows, <Code>bordered</Code> adds column hairlines, and <Code>stickyHeader</Code> with a <Code>maxHeight</Code> pins the header while the body scrolls. One row is marked <Code>selected</Code>.
        </P>
        <Example component="table" file="table/variants" title="Compact, striped, bordered, sticky" align="stretch">
          <TableVariants />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Table"
          rows={[
            { name: 'striped', type: 'boolean', default: 'false', description: 'Tint alternate body rows.' },
            { name: 'compact', type: 'boolean', default: 'false', description: '36px rows instead of 48px.' },
            { name: 'bordered', type: 'boolean', default: 'false', description: 'Hairline between columns.' },
            { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Pin the header row; pair with maxHeight.' },
            { name: 'maxHeight', type: 'number | string', description: 'Height at which the body scrolls (number is px).' },
            { name: 'label', type: 'string', description: 'Names the scroll region for screen readers.' },
            { name: 'wrapperClassName', type: 'string', description: 'Class for the bordered wrapper.' },
          ]}
        />
        <PropsTable
          title="TableRow, TableHead, TableCell"
          rows={[
            { name: 'selected', type: 'boolean', description: 'TableRow: tints the row (data-state="selected").' },
            { name: 'numeric', type: 'boolean', description: 'TableHead / TableCell: right-align with tabular figures.' },
            { name: 'align', type: "'left' | 'center' | 'right'", description: 'TableHead / TableCell: text alignment.' },
          ]}
        />
        <P>Also: <Code>TableHeader</Code>, <Code>TableBody</Code>, <Code>TableFooter</Code> and <Code>TableCaption</Code> map to their HTML elements and forward every prop.</P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Native table, row and cell semantics; header cells carry scope="col".',
            'The scroll wrapper is focusable so keyboard users can scroll wide tables; give it a name with label.',
            'Keep a caption or label so the table has an accessible name.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['Row hover and selection change colour in 150ms. Hover tints apply only to fine pointers.']} />
      </Section>
    </DocPage>
  );
}
