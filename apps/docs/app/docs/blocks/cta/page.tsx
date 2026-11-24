import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CtaBanner from '@/examples/blocks/cta/banner';
import CtaCard from '@/examples/blocks/cta/card';

export const metadata: Metadata = { title: 'Call to action' };

export default function CtaBlockPage() {
  return (
    <DocPage href="/docs/blocks/cta" wide>
      <Section id="banner" title="Banner">
        <P>
          A filled band in the primary colour with two soft glows. It follows the theme: dark on light pages, light on dark
          pages, and the accent colour when one is set.
        </P>
        <Example component="blocks/cta" file="blocks/cta/banner" title="Banner" align="stretch" minHeight={340}>
          <CtaBanner />
        </Example>
      </Section>

      <Section id="card" title="Card with gradient">
        <P>A quieter close: a bordered card with a subtle gradient, two actions and what the trial includes.</P>
        <Example component="blocks/cta" file="blocks/cta/card" title="Card with gradient" align="stretch" minHeight={440}>
          <CtaCard />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'At the end of a landing page, after the proof, to repeat the main action.',
            'Banner for a strong finish; card when the page is already busy with colour.',
          ]}
        />
        <P>Repeat the hero&apos;s primary action word for word, so people recognise it.</P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>Text on the band is <Code>--ui-primary-foreground</Code> on <Code>--ui-primary</Code>, measured at 4.5:1 or more in every accent.</>,
            'The text link on the band has its own focus outline in the foreground colour.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>The banner rises in with <Code>ui-animate-rise</Code>, the card&apos;s columns with <Code>ui-stagger</Code>, once, when they scroll into view.</>,
            'Reduced motion: they are visible from the start.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
