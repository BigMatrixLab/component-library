import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SeparatorBasic from '@/examples/separator/basic';
import SeparatorLabel from '@/examples/separator/label';

export const metadata: Metadata = { title: 'Separator' };

export default function SeparatorPage() {
  return (
    <DocPage href="/docs/components/separator">
      <Section id="basic" title="Horizontal and vertical">
        <P>A 1px line in the border colour. A vertical separator stretches to the height of its flex parent, so give the row a height.</P>
        <Example component="separator" file="separator/basic" title="Horizontal and vertical">
          <SeparatorBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Between groups of related content that need a little more distance than spacing gives.',
            'Between inline items in a toolbar or link row.',
            'Between alternatives, with a label: “or”.',
          ]}
        />
        <P>Not for: every item in a list (use spacing, or a bordered list), or to frame a card (use the card’s border).</P>
      </Section>

      <Section id="label" title="With a label">
        <P>Put text inside to get a centred label with a line on either side.</P>
        <Example component="separator" file="separator/label" title="Labelled separator">
          <SeparatorLabel />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Separator"
          rows={[
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the line.' },
            { name: 'decorative', type: 'boolean', default: 'true', description: <>Purely visual (<Code>role=&quot;none&quot;</Code>). Set <Code>false</Code> for a real thematic break (<Code>role=&quot;separator&quot;</Code>).</> },
            { name: 'children', type: 'ReactNode', description: 'Label text; draws the line on both sides.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded, including ref and className.' },
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Decorative by default: role="none", so assistive tech skips it. Most separators are only visual.',
            'Pass decorative={false} when the break is meaningful (between sections of content): it gets role="separator" and, if vertical, aria-orientation.',
            'A label’s text is real content and is read in order; pair a labelled separator with decorative (the default).',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['None. A separator is static.']} />
      </Section>
    </DocPage>
  );
}
