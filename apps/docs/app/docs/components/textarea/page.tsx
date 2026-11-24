import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TextareaAutoGrow from '@/examples/textarea/auto-grow';
import TextareaCounter from '@/examples/textarea/counter';
import TextareaStates from '@/examples/textarea/states';

export const metadata: Metadata = { title: 'Textarea' };

export default function TextareaPage() {
  return (
    <DocPage href="/docs/components/textarea">
      <Section id="usage" title="Usage">
        <P>
          A native <Code>&lt;textarea&gt;</Code> that grows with what you type. It uses CSS <Code>field-sizing: content</Code> where supported and measures the content in JavaScript where it is not. Try typing a few more lines.
        </P>
        <Example component="textarea" file="textarea/auto-grow" title="Auto-growing textarea">
          <TextareaAutoGrow />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Multi-line free text: notes, bios, descriptions, messages.',
            <>Text with a limit — turn on <Code>showCount</Code> with <Code>maxLength</Code>.</>,
          ]}
        />
        <P>Not for: a single line (use an input) or rich text and formatting (use an editor).</P>
      </Section>

      <Section id="counter" title="Character counter">
        <P>
          <Code>showCount</Code> adds a live count under the field. With <Code>maxLength</Code> it reads 42 / 160, turns amber at 90% and red at the limit. The counter is part of the field’s <Code>aria-describedby</Code>, so it is read when the field is focused rather than on every keystroke.
        </P>
        <Example component="textarea" file="textarea/counter" title="Textarea with counter">
          <TextareaCounter />
        </Example>
      </Section>

      <Section id="states" title="States and sizes">
        <Example component="textarea" file="textarea/states" title="Textarea states">
          <TextareaStates />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Textarea"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Text size and horizontal padding: 13 / 14 / 15px.' },
            { name: 'autoGrow', type: 'boolean', default: 'true', description: 'Grow with the content. When off, the box is vertically resizable.' },
            { name: 'rows', type: 'number', default: '3', description: 'Minimum height in lines.' },
            { name: 'maxRows', type: 'number', description: 'Stop growing at this many lines, then scroll.' },
            { name: 'showCount', type: 'boolean', default: 'false', description: 'Show a live character counter.' },
            { name: 'wrapperClassName', type: 'string', description: 'Class for the wrapper that holds the counter.' },
            { name: '...props', type: 'TextareaHTMLAttributes', description: 'Forwarded to <textarea>, including ref, value, defaultValue, maxLength, disabled, readOnly.' },
          ]}
        />
        <P>In plain HTML: <Code>ui-textarea</Code> with <Code>data-autogrow</Code>, optionally <Code>ui-textarea-sm</Code> or <Code>ui-textarea-lg</Code>.</P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Enter', 'Inserts a new line.'], ['Tab', 'Moves focus out of the field.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native textarea; inside a Field the id, description, invalid and required state are wired automatically.',
            'maxLength is enforced by the browser, so a screen reader user cannot silently exceed it.',
            'Counter colours use the warning and destructive text tokens, and the number is always shown.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The box follows the text without animating its height, so typing never feels delayed.',
            'Border, ring and counter colour transition over 150ms. Reduced motion keeps the colour change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
