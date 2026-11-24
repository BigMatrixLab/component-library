import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SpinnerVariants from '@/examples/spinner/variants';
import SpinnerInContext from '@/examples/spinner/in-context';

export const metadata: Metadata = { title: 'Spinner' };

export default function SpinnerPage() {
  return (
    <DocPage href="/docs/components/spinner">
      <Section id="variants" title="Variants and sizes">
        <P>A ring (default) or three dots, from 12 to 40px. The spinner takes the colour of its text, so it works on any surface.</P>
        <Example component="spinner" file="spinner/variants" title="Spinner variants and sizes">
          <SpinnerVariants />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Work is in progress and you cannot say how long it will take: syncing, searching, loading a page.',
            'Inline next to the text that says what is happening.',
          ]}
        />
        <P>
          Not for: measurable work (use progress), a content area whose shape you know (use a skeleton), or a button that is busy (<Code>Button</Code> has its own <Code>loading</Code> state).
        </P>
      </Section>

      <Section id="in-context" title="In context">
        <P>Say what is happening in words beside the spinner. When the surrounding text already says it, pass <Code>label=&#123;false&#125;</Code> so it is not announced twice.</P>
        <Example component="spinner" file="spinner/in-context" title="Spinner in context" align="start">
          <SpinnerInContext />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Spinner"
          rows={[
            { name: 'variant', type: "'ring' | 'dots'", default: "'ring'", description: 'Shape of the indicator.' },
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: '12 / 16 / 20 / 28 / 40px.' },
            { name: 'label', type: 'string | false', default: "'Loading'", description: 'Visually hidden text for screen readers. false makes the spinner purely decorative.' },
            { name: '...props', type: 'HTMLAttributes<HTMLSpanElement>', description: 'Forwarded, including ref and className.' },
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="status" plus visually hidden text: a polite live region, so “Loading” is announced without stealing focus.',
            'With label={false} the spinner is aria-hidden and has no role; put the status on the surrounding element instead.',
            'The ring and dots are aria-hidden; they carry no information that the label does not.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Ring: a 0.7s linear rotation. Dots: a 1s staggered bounce with a fade.',
            'Reduced motion: the indicator holds still; the label still tells the user the work is in progress.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
