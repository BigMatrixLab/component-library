import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TestimonialsQuoteGrid from '@/examples/blocks/testimonials/quote-grid';
import TestimonialsSingle from '@/examples/blocks/testimonials/single';
import TestimonialsMarquee from '@/examples/blocks/testimonials/marquee';

export const metadata: Metadata = { title: 'Testimonials' };

export default function TestimonialsBlockPage() {
  return (
    <DocPage href="/docs/blocks/testimonials" wide>
      <Section id="quote-grid" title="Quote grid">
        <P>Six quotes in masonry columns, the first one featured. Short and long quotes sit together without gaps.</P>
        <Example component="blocks/testimonials" file="blocks/testimonials/quote-grid" title="Quote grid" align="stretch" minHeight={640}>
          <TestimonialsQuoteGrid />
        </Example>
      </Section>

      <Section id="single" title="Single large quote">
        <P>
          One customer story told well, with three results that roll in with <Code>AnimatedNumber</Code> when they scroll
          into view.
        </P>
        <Example component="blocks/testimonials" file="blocks/testimonials/single" title="Single large quote" align="stretch" minHeight={560}>
          <TestimonialsSingle />
        </Example>
      </Section>

      <Section id="marquee" title="Marquee row">
        <P>
          A row of short quotes that drifts sideways. It pauses on hover and with the Pause button; with reduced motion it
          becomes a row you scroll yourself.
        </P>
        <Example component="blocks/testimonials" file="blocks/testimonials/marquee" title="Marquee row" align="stretch" minHeight={440}>
          <TestimonialsMarquee />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Quote grid: plenty of good quotes from recognisable roles.',
            'Single quote: one strong story with numbers behind it, ideally near pricing.',
            'Marquee: many one-liners, as ambient proof. Keep each quote under twenty words.',
          ]}
        />
        <P>Use real people with their permission. Name, role and company make a quote believable; a first name alone does not.</P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Quotes are figure, blockquote and figcaption.',
            'The marquee has a visible pause control and stops on hover (WCAG 2.2.2). Its second, looping copy is aria-hidden.',
            'With reduced motion the row is a focusable scroll region, so keyboard users can reach every quote.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Entrance: one <Code>ui-stagger</Code> group per block, started when it scrolls into view.</>,
            'Marquee: Web Animations API, translateX(0 → −50%) over two copies, 36px per second, linear and infinite.',
            'Reduced motion: no drift, no hidden content, numbers appear without rolling.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
