import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import OtpVerify from '@/examples/input-otp/verify';
import OtpGroups from '@/examples/input-otp/groups';
import OtpAlphanumeric from '@/examples/input-otp/alphanumeric';
import OtpSizes from '@/examples/input-otp/sizes';

export const metadata: Metadata = { title: 'Input OTP' };

export default function InputOtpPage() {
  return (
    <DocPage href="/docs/components/input-otp">
      <Section id="verify" title="Verify a code">
        <P>One box per digit, one real input underneath. Type, paste the whole code, or let SMS autofill it. <Code>onComplete</Code> fires once when every box is full.</P>
        <Example component="input-otp" file="input-otp/verify" title="Verify a code">
          <OtpVerify />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Two-factor and email/SMS verification codes, invite codes and short PINs.',
            'Fixed-length codes of 4 to 8 characters.',
            'Not for passwords or free text (use an input), or for codes of unknown length.',
          ]}
        />
      </Section>

      <Section id="groups" title="Groups">
        <P><Code>groups</Code> splits the boxes with a separator: <Code>[3, 3]</Code> reads 123 – 456. The total replaces <Code>length</Code>.</P>
        <Example component="input-otp" file="input-otp/groups" title="Groups">
          <OtpGroups />
        </Example>
      </Section>

      <Section id="pattern" title="Letters and digits">
        <P><Code>pattern=&quot;alphanumeric&quot;</Code> accepts letters too, and the mobile keyboard switches from numeric to text. Pass <Code>name</Code> to submit it with a form.</P>
        <Example component="input-otp" file="input-otp/alphanumeric" title="Letters and digits">
          <OtpAlphanumeric />
        </Example>
      </Section>

      <Section id="sizes" title="Sizes and states">
        <P>Boxes are 32×40, 40×48 and 48×56. <Code>invalid</Code> turns the border red and sets <Code>aria-invalid</Code>.</P>
        <Example component="input-otp" file="input-otp/sizes" title="Sizes and states">
          <OtpSizes />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="InputOTP"
          rows={[
            { name: 'length', type: 'number', default: '6', description: 'Number of characters. Ignored when groups is set.' },
            { name: 'groups', type: 'number[]', description: 'Boxes per group, e.g. [3, 3].' },
            { name: 'separator', type: 'ReactNode', description: 'Shown between groups. Default: a short dash.' },
            { name: 'pattern', type: "'digits' | 'alphanumeric'", default: "'digits'", description: 'Allowed characters; anything else is dropped on type and paste.' },
            { name: 'value / defaultValue', type: 'string', description: 'The code so far.' },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called on every change.' },
            { name: 'onComplete', type: '(value: string) => void', description: 'Called once when all boxes are filled.' },
            { name: 'invalid', type: 'boolean', description: 'Error state.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Box size.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to the real input: name, disabled, autoFocus, aria-label (default “One-time code”).' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['0–9 (or letters)', 'Fills the active box and moves on.'],
            ['Backspace', 'Deletes the previous character.'],
            ['Left / Right', 'Move between boxes.'],
            ['Home / End', 'First box / the next empty box.'],
            ['Ctrl/Cmd + V', 'Pastes and fills all boxes; separators and spaces are ignored.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A single text input with autocomplete="one-time-code", so screen readers, password managers and SMS autofill treat it as one field. Give it an aria-label.',
            'The boxes are decorative (aria-hidden); the value is read from the input.',
            'inputMode and pattern bring up the numeric keypad on phones. Font size stays 16px so iOS does not zoom.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The active box takes the focus ring; an empty active box shows a blinking caret.',
            'Reduced motion: the caret stays visible and still.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
