import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ApiKeyCopy from '@/examples/copy-button/api-key';
import CopyButtonVariants from '@/examples/copy-button/variants';

export const metadata: Metadata = { title: 'Copy button' };

export default function CopyButtonPage() {
  return (
    <DocPage href="/docs/components/copy-button">
      <Section id="api-key" title="API key">
        <P>
          An icon-only copy button inside an input group. The icon swaps to a check with a small pop, a live region says “Copied”, and it reverts after 1.5 seconds.
        </P>
        <Example component="copy-button" file="copy-button/api-key" title="API key with copy">
          <ApiKeyCopy />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Anything people paste elsewhere: API keys, ids, commands, share links, error details.',
            'Beside the value, not instead of it: show the text so people can verify what they copied.',
          ]}
        />
      </Section>

      <Section id="variants" title="Labelled and icon-only">
        <P>
          Add <Code>label</Code> for a text button; it keeps one width while “Copy” becomes “Copied”. Icon-only buttons need an <Code>aria-label</Code>. <Code>value</Code> may be a function, read at click time.
        </P>
        <Example component="copy-button" file="copy-button/variants" title="Copy button variants">
          <CopyButtonVariants />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="CopyButton"
          rows={[
            { name: 'value', type: 'string | () => string', description: 'The text to copy.' },
            { name: 'label', type: 'ReactNode', description: 'Visible text. Omit for icon-only.' },
            { name: 'copiedLabel / errorLabel', type: 'ReactNode', default: "'Copied' / 'Copy failed'", description: 'Text for each state.' },
            { name: 'resetAfter', type: 'number', default: '1500', description: 'Milliseconds before returning to idle.' },
            { name: 'onCopy / onCopyError', type: '(text) => void / () => void', description: 'Callbacks.' },
            { name: 'variant, size, ...props', type: 'ButtonProps', description: 'Forwarded to Button (outline when labelled, ghost when icon-only; size sm).' },
          ]}
        />
        <P>
          <Code>useCopy({'{ resetAfter, onCopy, onError }'})</Code> returns <Code>{'{ copy, copied, error, status, reset }'}</Code> for custom triggers. <Code>copyText(text)</Code> is the helper underneath: it uses the Clipboard API and falls back to a hidden textarea.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Enter / Space', 'Copies the value.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native button. Its name stays “Copy”; a polite live region announces “Copied” or “Copy failed”.',
            'Success and error are shown by icon and text, not colour alone.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The copy icon shrinks and blurs out as the check pops in (snappy spring). An error shakes the alert icon slightly.',
            'Reduced motion: the icons swap without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
