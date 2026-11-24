import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import HeroCentered from '@/examples/blocks/hero/centered';
import HeroSplit from '@/examples/blocks/hero/split';
import HeroMinimal from '@/examples/blocks/hero/minimal';

export const metadata: Metadata = { title: 'Hero' };

export default function HeroBlockPage() {
  return (
    <DocPage href="/docs/blocks/hero" wide>
      <Section id="centered" title="Centered with product mock">
        <P>
          The classic opener: an announcement pill, one headline, two actions and a product screenshot. The screenshot is
          drawn with divs and semantic colours, so it needs no image and follows light, dark and the accent.
        </P>
        <Example component="blocks/hero" file="blocks/hero/centered" title="Centered with product mock" align="stretch" minHeight={760}>
          <HeroCentered />
        </Example>
      </Section>

      <Section id="split" title="Split with visual">
        <P>Copy on the left, a visual of the product at work on the right. Stacks on phones with the visual below the actions.</P>
        <Example component="blocks/hero" file="blocks/hero/split" title="Split with visual" align="stretch" minHeight={620}>
          <HeroSplit />
        </Example>
      </Section>

      <Section id="minimal" title="Minimal">
        <P>
          Typography only, for developer tools: a two-tone headline, the install command with a <Code>CopyButton</Code>,
          and the customers who use it.
        </P>
        <Example component="blocks/hero" file="blocks/hero/minimal" title="Minimal" align="stretch" minHeight={560}>
          <HeroMinimal />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Centered: a broad product with a UI worth showing off.',
            'Split: one specific job (incidents, payments) best shown as a single moment.',
            'Minimal: developer tools and APIs, where the command is the product.',
          ]}
        />
        <P>One hero per page, always first. Keep it to one primary action; the second is a quieter outline or ghost button.</P>
      </Section>

      <Section id="customising" title="Customising">
        <List
          items={[
            <>The outer <Code>rounded-2xl border</Code> frames the block in these docs; drop it for a full-bleed section.</>,
            <>The header is plain markup. Swap in your own navbar, and add a menu button below <Code>md</Code> where the links hide.</>,
            <>Gradients use <Code>color-mix()</Code> on the series tokens at 9–14%, so they follow the theme. Keep them that faint.</>,
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The headline is the page’s only h1.',
            'Mocks and visuals are one role="img" with a label describing what they show.',
            'Actions are real links (Button asChild), 44px tall.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The copy rises in with ui-stagger on load; the visual follows with ui-animate-rise after 160–200ms.',
            'Reduced motion: everything appears in place.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
