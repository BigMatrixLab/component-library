import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CustomerDetails from '@/examples/description-list/customer';
import StackedDetails from '@/examples/description-list/stacked';

export const metadata: Metadata = { title: 'Description list' };

export default function DescriptionListPage() {
  return (
    <DocPage href="/docs/components/description-list">
      <Section id="customer" title="Customer details">
        <P>
          Horizontal with dividers inside a card. The label column appears once the <em>list</em> is about 512px wide, so it adapts to its container, not the viewport.
        </P>
        <Example component="description-list" file="description-list/customer" title="Customer details" align="stretch">
          <CustomerDetails />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Key / value facts about one thing: a customer, an invoice, a deployment.',
            'Details may hold anything: text, a badge, a link, a copy button. An empty value shows a dash.',
          ]}
        />
        <P>Not for comparing many records (use a table).</P>
      </Section>

      <Section id="stacked" title="Stacked">
        <P>The default puts each term above its details, which suits narrow columns and sidebars.</P>
        <Example component="description-list" file="description-list/stacked" title="Stacked lists" align="stretch">
          <StackedDetails />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="DescriptionList"
          rows={[
            { name: 'orientation', type: "'stacked' | 'horizontal'", default: "'stacked'", description: 'Horizontal adds a label column in containers ≥ 32rem.' },
            { name: 'divided', type: 'boolean', default: 'false', description: 'A hairline between items.' },
            { name: 'labelWidth', type: 'string', default: "'11rem'", description: 'Label column width.' },
          ]}
        />
        <P>
          <Code>DescriptionItem</Code> groups a <Code>DescriptionTerm</Code> (<Code>&lt;dt&gt;</Code>) with its <Code>DescriptionDetails</Code> (<Code>&lt;dd&gt;</Code>). All forward their props.
        </P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Native dl / dt / dd, with div wrappers (valid HTML), so assistive tech announces term and details together.',
            'Long values wrap instead of overflowing.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['None.']} />
      </Section>
    </DocPage>
  );
}
