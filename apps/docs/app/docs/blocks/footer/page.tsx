import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import FooterMultiColumn from '@/examples/blocks/footer/multi-column';
import FooterMinimal from '@/examples/blocks/footer/minimal';

export const metadata: Metadata = { title: 'Footer' };

export default function FooterBlockPage() {
  return (
    <DocPage href="/docs/blocks/footer" wide>
      <Section id="multi-column" title="Multi-column with newsletter">
        <P>
          Brand, a newsletter sign-up and four columns of links, with a live status badge in the bottom bar. Submitting the
          form shows a thank-you line in place, announced to screen readers.
        </P>
        <Example component="blocks/footer" file="blocks/footer/multi-column" title="Multi-column with newsletter" align="stretch" minHeight={460}>
          <FooterMultiColumn />
        </Example>
      </Section>

      <Section id="minimal" title="Minimal">
        <P>One row: logo, copyright and a handful of links. No JavaScript, so it stays a Server Component.</P>
        <Example component="blocks/footer" file="blocks/footer/minimal" title="Minimal" align="stretch" minHeight={140}>
          <FooterMinimal />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Multi-column: marketing sites with docs, a blog and a company section.',
            'Minimal: single-product pages, docs sites and app landing pages.',
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>A top-level <Code>&lt;footer&gt;</Code> is the contentinfo landmark; links sit in <Code>&lt;nav aria-label=&quot;Footer&quot;&gt;</Code>.</>,
            'Column titles are headings, so screen-reader users can jump between them.',
            'The email field has a visible label, autocomplete="email" and a role="status" result line.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Multi-column: one <Code>ui-stagger</Code> entrance when it scrolls into view; the status dot pulses.</>,
            'Minimal: no motion. Reduced motion stops the pulse and the entrance.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
