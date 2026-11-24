import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ExpandingSearchDocsSearch from '@/examples/expanding-search/docs-search';

export const metadata: Metadata = { title: 'Expanding search' };

export default function ExpandingSearchPage() {
  return (
    <DocPage href="/docs/components/expanding-search">
      <Section id="docs-search" title="Docs search">
        <P>An icon that grows into a search field. Click it (or press ⌘K / Ctrl K), type “d” to see results, then press Esc to fold it back.</P>
        <Example component="expanding-search" file="expanding-search/docs-search" title="Docs search" align="start" minHeight={300}>
          <ExpandingSearchDocsSearch />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Toolbars and headers where search is secondary and space is tight.',
            'When you want the field to take over the row only while it is in use.',
            <>If search is the main task of the page, show a normal <Code>Input</Code> with a search icon instead.</>,
          ]}
        />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ExpandingSearch"
          rows={[
            { name: 'value / defaultValue / onValueChange', type: 'string', description: 'The query, controlled or uncontrolled.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', default: 'false', description: 'Expanded state, controlled or uncontrolled.' },
            { name: 'placeholder', type: 'string', default: "'Search'", description: 'Input placeholder.' },
            { name: 'label', type: 'string', default: "'Search'", description: 'Accessible name of the button and the field.' },
            { name: 'width', type: 'number | string', default: '280', description: 'Expanded width (px or any CSS length). Never wider than the viewport minus 32px.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: 'shortcut', type: 'boolean', default: 'false', description: 'Press ⌘K (Ctrl K elsewhere) to expand and focus. Shows a hint while empty.' },
            { name: 'onSubmit', type: '(value: string) => void', description: 'Enter pressed in the field.' },
            { name: 'results', type: 'ReactNode', description: 'Panel under the field while it is open and has a query.' },
          ]}
        />
        <P>The results panel is positioned absolutely under the field, so keep the component out of ancestors with <Code>overflow: hidden</Code>.</P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'On the icon: expands and focuses the field.'],
            ['⌘K / Ctrl K', 'With shortcut: expands and focuses from anywhere.'],
            ['Enter', 'In the field: onSubmit.'],
            ['Esc', 'Clears the query, collapses and returns focus to the icon.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The wrapper is a search landmark. The icon button has an accessible name and aria-expanded.',
            'The input is hidden from the tab order and the accessibility tree until the field is open, and focus moves into it when it opens.',
            'It folds back on blur only when empty, so a typed query is never lost; Tab out with text and it stays open.',
            'The input is type="search" with the browser’s own clear control replaced by a consistent Clear button.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Width: a CSS transition on <Code>--ui-spring-smooth</Code> (540ms, never overshoots) between the square icon button (36px) and the expanded width.</>,
            'The input fades in 90ms after the field starts to grow, and stays mounted until the fold-back has finished so it never pops out.',
            'The results panel enters with the soft rise (380ms, 4px, blur clearing) and leaves faster (160ms).',
            'Reduced motion: the field opens and closes instantly; focus and results still behave the same.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
