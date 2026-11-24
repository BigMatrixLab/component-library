import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import PaginationBasic from '@/examples/pagination/basic';
import PaginationCompact from '@/examples/pagination/compact';
import PaginationAsLink from '@/examples/pagination/as-link';

export const metadata: Metadata = { title: 'Pagination' };

export default function PaginationPage() {
  return (
    <DocPage href="/docs/components/pagination">
      <Section id="usage" title="Usage">
        <P>
          Compose the control from <Code>PaginationLink</Code>s and let <Code>usePagination</Code> decide which numbers and ellipses to show. The list keeps the same length while you page, so the control never changes width.
        </P>
        <Example component="pagination" file="pagination/basic" title="Page numbers" align="stretch">
          <PaginationBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Collections where people look for a specific position: invoices, search results, logs.',
            'Server-paged data, where each page is a URL (use links, so it can be shared and crawled).',
          ]}
        />
        <P>Not for: feeds (infinite scroll or “Load more”), or fewer than two pages of results.</P>
      </Section>

      <Section id="compact" title="Compact">
        <P>When space is short, replace the numbers with <Code>PaginationStatus</Code>: “Page 3 of 12”. On phones, Previous and Next also collapse to arrows.</P>
        <Example component="pagination" file="pagination/compact" title="Compact" align="stretch">
          <PaginationCompact />
        </Example>
      </Section>

      <Section id="as-child" title="As links">
        <P>
          Give <Code>PaginationLink</Code> an <Code>href</Code> for a plain anchor, or use <Code>asChild</Code> with a Next.js <Code>Link</Code>. The pure function <Code>getPaginationRange</Code> works on the server.
        </P>
        <Example component="pagination" file="pagination/as-link" title="With Next.js Link" align="stretch">
          <PaginationAsLink />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="usePagination(options)"
          rows={[
            { name: 'page', type: 'number', description: 'Current page, 1-based.' },
            { name: 'total', type: 'number', description: 'Number of pages.' },
            { name: 'siblings', type: 'number', default: '1', description: 'Pages on each side of the current one.' },
            { name: 'boundaries', type: 'number', default: '1', description: 'Pages always shown at each end.' },
          ]}
        />
        <P>Returns an array of page numbers and the strings <Code>'ellipsis-start'</Code> / <Code>'ellipsis-end'</Code>.</P>
        <PropsTable
          title="PaginationLink"
          rows={[
            { name: 'isActive', type: 'boolean', default: 'false', description: 'The current page: aria-current="page" and the filled style.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'First / last page: stays in the layout, ignores clicks.' },
            { name: 'href', type: 'string', description: 'Renders an anchor. Without it the link is a button.' },
            { name: 'size', type: "'icon' | 'default'", default: "'icon'", description: 'Square for numbers, wide for Previous / Next.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element (e.g. Next.js Link).' },
          ]}
        />
        <P>
          <Code>PaginationPrevious</Code> and <Code>PaginationNext</Code> take the same props with an arrow and a label. <Code>PaginationStatus</Code> takes <Code>page</Code> and <Code>total</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Tab', 'Moves between the links; disabled ones are skipped.'], ['Enter', 'Goes to the page.'], ['Space', 'Goes to the page (buttons).']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A nav landmark labelled “Pagination” holding a list. The current page has aria-current="page".',
            'Give page numbers an aria-label such as “Page 6”; Previous and Next are labelled for you.',
            'The status text is a polite live region, so a page change is announced.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Presses scale to .97 on the snappy spring; colours change in 150ms.',
            'Reduced motion drops the press scale.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
