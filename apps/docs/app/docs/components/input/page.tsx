import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import InputStates from '@/examples/input/states';
import InputSizes from '@/examples/input/sizes';
import InputGroupExample from '@/examples/input/group';
import InputPassword from '@/examples/input/password';

export const metadata: Metadata = { title: 'Input' };

export default function InputPage() {
  return (
    <DocPage href="/docs/components/input">
      <Section id="usage" title="Usage">
        <P>
          A native <Code>&lt;input&gt;</Code> with calm borders, a soft focus ring and a subtle filled background in dark mode. Pair it with a <Code>Field</Code> and <Code>Label</Code>; on its own, give it an <Code>aria-label</Code>.
        </P>
        <Example component="input" file="input/states" title="Input states">
          <InputStates />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Short, single-line text: names, emails, URLs, numbers, search.',
            <>With icons, a prefix or a suffix — use <Code>InputGroup</Code>.</>,
            <>Secrets that users may want to check — use <Code>PasswordInput</Code>.</>,
          ]}
        />
        <P>Not for: long or multi-line text (use a textarea), picking from a fixed list (use a select), dates and times without a picker.</P>
      </Section>

      <Section id="sizes" title="Sizes">
        <P>32, 36 and 44px tall. Use <Code>lg</Code> for the main field on a touch-first screen. On touch devices the text is 16px so iOS Safari does not zoom the page on focus.</P>
        <Example component="input" file="input/sizes" title="Input sizes">
          <InputSizes />
        </Example>
      </Section>

      <Section id="group" title="Icons, addons and actions">
        <P>
          <Code>InputGroup</Code> draws one border around the input and its neighbours. <Code>InputIcon</Code> is decorative, <Code>InputAddon</Code> is attached text such as https:// or USD, and <Code>InputAction</Code> is an icon button inside the field. Clicking any non-interactive part of the group focuses the input. Set the <Code>size</Code> on the group.
        </P>
        <Example component="input" file="input/group" title="Input group">
          <InputGroupExample />
        </Example>
      </Section>

      <Section id="password" title="Password">
        <P>
          <Code>PasswordInput</Code> is an input plus a reveal button. The button has a constant label and <Code>aria-pressed</Code>, and swaps the eye and eye-off icons.
        </P>
        <Example component="input" file="input/password" title="Password input">
          <InputPassword />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Input"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to <input>, including ref, type, value, defaultValue, disabled, readOnly.' },
          ]}
        />
        <PropsTable
          title="InputGroup and parts"
          rows={[
            { name: 'InputGroup size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height of the whole group.' },
            { name: 'InputIcon', type: 'span', description: 'Decorative icon (aria-hidden), before or after the input.' },
            { name: 'InputAddon', type: 'span', description: 'Attached text at either edge, with a divider.' },
            { name: 'InputAction', type: 'button', description: 'Icon button inside the field. Needs an aria-label. type defaults to "button".' },
          ]}
        />
        <PropsTable
          title="PasswordInput"
          rows={[
            { name: 'visible / defaultVisible', type: 'boolean', default: 'false', description: 'Controlled / initial visibility.' },
            { name: 'onVisibleChange', type: '(visible: boolean) => void', description: 'Called when the toggle is pressed.' },
            { name: 'toggleLabel', type: 'string', default: "'Show password'", description: 'Accessible name of the reveal button.' },
            { name: '...props', type: 'InputProps (without type)', description: 'Forwarded to the input.' },
          ]}
        />
        <P>In plain HTML: <Code>ui-input</Code>, <Code>ui-input-sm</Code>, <Code>ui-input-lg</Code>, and <Code>ui-input-group</Code> with <Code>ui-input-icon</Code>, <Code>ui-input-addon</Code>, <Code>ui-input-action</Code>.</P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves into and out of the field, and to the action button.'],
            ['Enter / Space', 'On an action button, activates it (for example, reveals the password).'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native input, so text entry, autofill, spellcheck and mobile keyboards behave as expected.',
            'Inside a Field the id, aria-describedby, aria-invalid and required are wired automatically.',
            'The invalid state is a destructive border plus the error message, not colour alone.',
            'The reveal button has a fixed accessible name and aria-pressed; icons are aria-hidden.',
            'Disabled inputs are dimmed; read-only inputs stay focusable and show a muted fill.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Border, ring and background transition over 150ms with the standard ease.',
            'Action buttons press to .94 on the snappy spring.',
            'Hover tints apply only on devices with a fine pointer. Reduced motion keeps the colour change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
