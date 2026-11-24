import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import PricingTiers from '@/examples/blocks/pricing/tiers';
import PricingComparison from '@/examples/blocks/pricing/comparison';
import PricingFaq from '@/examples/blocks/pricing/faq';

export const metadata: Metadata = { title: 'Pricing blocks' };

export default function PricingBlocksPage() {
  return (
    <DocPage href="/docs/blocks/pricing" wide>
      <Section id="tiers" title="Three tiers">
        <P>
          Three plan cards with the recommended one outlined in the primary colour. A <Code>SegmentedControl</Code> switches between monthly and yearly; prices roll to
          their new value with <Code>AnimatedNumber</Code> and the note under each price says how it is billed.
        </P>
        <Example component="blocks/pricing" file="blocks/pricing/tiers" title="Three tiers" align="stretch" minHeight={760}>
          <PricingTiers />
        </Example>
      </Section>

      <Section id="comparison" title="Feature comparison">
        <P>
          A full comparison table grouped by topic. Features are row headers, so a screen reader reads “Audit log, Pro, 30 days”. On narrow screens the table scrolls
          sideways while the feature column stays put.
        </P>
        <Example component="blocks/pricing" file="blocks/pricing/comparison" title="Feature comparison" align="stretch" minHeight={720}>
          <PricingComparison />
        </Example>
      </Section>

      <Section id="faq" title="FAQ">
        <P>Questions about billing in an accordion beside a short invitation to get in touch. One answer is open at a time and the first starts open.</P>
        <Example component="blocks/pricing" file="blocks/pricing/faq" title="FAQ" align="stretch" minHeight={520}>
          <PricingFaq />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Public pricing pages and the plan picker inside an app’s billing settings.',
            'Two to four plans. With more, lead with a short quiz or a “contact us” tier instead of more columns.',
            'Not for: usage-based pricing that needs a calculator (add a slider-driven estimate instead of fixed tiers).',
          ]}
        />
      </Section>

      <Section id="design" title="Design notes">
        <List
          items={[
            'This is a marketing block, so a faint wash of the primary colour behind the heading is allowed (design rule D2). Cards stay flat on a 1px border.',
            'Only the recommended plan gets a primary button; the others are outline so the eye lands on one choice.',
            'Prices use tabular figures so the digits don’t shift while they roll. Reduced motion swaps them instantly.',
            'Check marks have the accessible name “Included” and dashes “Not included”, so the table reads correctly without colour.',
          ]}
        />
      </Section>

      <Section id="responsive" title="Responsive">
        <List
          items={[
            'Cards sit in three columns from 48rem of block width and stack below that, in the same order.',
            'The comparison table keeps a 38rem minimum width and scrolls inside its own rounded frame; the frame is focusable so keyboard users can scroll it.',
            'The FAQ moves its heading above the accordion below 48rem.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
