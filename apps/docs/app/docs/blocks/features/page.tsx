import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import FeaturesIconGrid from '@/examples/blocks/features/icon-grid';
import FeaturesBento from '@/examples/blocks/features/bento';
import FeaturesAlternating from '@/examples/blocks/features/alternating';

export const metadata: Metadata = { title: 'Features' };

export default function FeaturesBlockPage() {
  return (
    <DocPage href="/docs/blocks/features" wide>
      <Section id="icon-grid" title="Icon grid">
        <P>Six features, one sentence each, in one to three columns. The quickest way to cover breadth.</P>
        <Example component="blocks/features" file="blocks/features/icon-grid" title="Icon grid" align="stretch" minHeight={620}>
          <FeaturesIconGrid />
        </Example>
      </Section>

      <Section id="bento" title="Bento grid">
        <P>
          Tiles of different sizes, each with a small decorative visual. Give the biggest tile to the feature that sells the
          product.
        </P>
        <Example component="blocks/features" file="blocks/features/bento" title="Bento grid" align="stretch" minHeight={760}>
          <FeaturesBento />
        </Example>
      </Section>

      <Section id="alternating" title="Alternating rows">
        <P>Depth over breadth: three features, each with a checklist and a visual, the sides swapping row by row.</P>
        <Example component="blocks/features" file="blocks/features/alternating" title="Alternating rows" align="stretch" minHeight={900}>
          <FeaturesAlternating />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Icon grid: six or so equal features, scanned rather than read.',
            'Bento: four or five features where one clearly leads.',
            'Alternating rows: two to four features that each need a paragraph and a picture.',
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Section title is an h2; each feature is an h3 inside a list item.',
            <>Bento visuals are <Code>aria-hidden</Code>; alternating visuals are one <Code>role=&quot;img&quot;</Code> with a label.</>,
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>One entrance per block: the list gets <Code>ui-stagger</Code> the first time it scrolls into view (IntersectionObserver).</>,
            <>Until then it is <Code>motion-safe:opacity-0</Code>, so with reduced motion it is never hidden.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
