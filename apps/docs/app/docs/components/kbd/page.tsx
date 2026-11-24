import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import KbdShortcuts from '@/examples/kbd/shortcuts';
import KbdInContext from '@/examples/kbd/in-context';

export const metadata: Metadata = { title: 'Kbd' };

export default function KbdPage() {
  return (
    <DocPage href="/docs/components/kbd">
      <Section id="shortcuts" title="Keys and combinations">
        <P>
          A key cap in the mono face with a border and a thin lip underneath. <Code>KbdGroup</Code> joins keys into a combination; <Code>plus</Code> draws a “+” between them.
        </P>
        <Example component="kbd" file="kbd/shortcuts" title="Keys and combinations">
          <KbdShortcuts />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Show a shortcut next to the action it triggers: menu items, command palette, buttons.',
            'Name a key inside instructions: “Press Esc to close”.',
          ]}
        />
        <P>Not for: code or file names (use inline code), or buttons that can be clicked (use a button).</P>
      </Section>

      <Section id="in-context" title="In context">
        <P>Small keys fit inline text and menu rows; keep one size per list.</P>
        <Example component="kbd" file="kbd/in-context" title="Kbd in context" align="start">
          <KbdInContext />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Kbd"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '20 / 24 / 28px tall.' },
            { name: '...props', type: 'HTMLAttributes<HTMLElement>', description: 'Forwarded to <kbd>, including ref and className.' },
          ]}
        />
        <PropsTable
          title="KbdGroup"
          rows={[
            { name: 'plus', type: 'boolean', default: 'false', description: 'Draw a “+” between the keys.' },
            { name: '...props', type: 'HTMLAttributes<HTMLSpanElement>', description: 'Forwarded to the wrapper.' },
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Renders the semantic <kbd> element; screen readers read the text of each key.',
            'The “+” between keys is generated content with empty alt text, so it is not announced; for symbol-only keys add an aria-label to the group (“Shortcut: Command K”).',
            'Key text meets 4.5:1 on its fill in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List items={['None. A key cap is static.']} />
      </Section>
    </DocPage>
  );
}
