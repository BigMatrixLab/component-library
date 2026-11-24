import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import NumberInputSeats from '@/examples/number-input/seats';
import NumberInputPrice from '@/examples/number-input/price';
import NumberInputPercent from '@/examples/number-input/percent';
import NumberInputControls from '@/examples/number-input/controls';

export const metadata: Metadata = { title: 'Number input' };

export default function NumberInputPage() {
  return (
    <DocPage href="/docs/components/number-input">
      <Section id="usage" title="Usage">
        <P>
          A spinbutton that looks like our <Code>Input</Code>, with − and + buttons, min, max and step. The value is a real number (or <Code>null</Code> when the field is empty), never a string.
        </P>
        <Example component="number-input" file="number-input/seats" title="Seats">
          <NumberInputSeats />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Small counts and amounts people nudge up and down: seats, quantity, guests, discounts.',
            'Money and percentages, where the shown text (€1,249.00, 15%) differs from the stored number.',
          ]}
        />
        <P>Not for: phone numbers, postcodes, card numbers or ids (use a text input), or picking a value from a wide range (use a slider).</P>
      </Section>

      <Section id="format" title="Currency and locale">
        <P>
          <Code>format</Code> is <Code>number</Code>, <Code>currency</Code> or <Code>percent</Code>, shown with <Code>Intl.NumberFormat</Code> in the given <Code>locale</Code>. The typed text is parsed on blur (and on Enter) in the same locale: group separators, symbols and a trailing % are ignored. Unreadable text is dropped and the previous value returns. Pass <Code>locale</Code> explicitly so server and client render the same text.
        </P>
        <Example component="number-input" file="number-input/price" title="Price in euros">
          <NumberInputPrice />
        </Example>
        <P>
          Percent values are fractions, like <Code>Intl</Code>: 0.15 shows as 15%, so one percentage point is <Code>step=&#123;0.01&#125;</Code>. Mouse-wheel stepping is opt-in with <Code>allowWheel</Code>, and only works while the field is focused.
        </P>
        <Example component="number-input" file="number-input/percent" title="Percent with wheel">
          <NumberInputPercent />
        </Example>
      </Section>

      <Section id="controls" title="Buttons and sizes">
        <P>
          Buttons sit <Code>inside</Code> the field, are <Code>attached</Code> as segments, or are hidden with <Code>none</Code>. A button disables itself at its bound. Hold a button to repeat; the longer you hold, the faster and bigger the steps.
        </P>
        <Example component="number-input" file="number-input/controls" title="Controls">
          <NumberInputControls />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="NumberInput"
          rows={[
            { name: 'value / defaultValue', type: 'number | null', default: 'null', description: 'Controlled / initial value. null is an empty field.' },
            { name: 'onValueChange', type: '(value: number | null) => void', description: 'Called when a value is committed: step, key, wheel, blur or Enter. Not on each keystroke.' },
            { name: 'min / max', type: 'number', description: 'Bounds. Values are clamped; the buttons disable at them.' },
            { name: 'step / largeStep', type: 'number', default: '1 / step × 10', description: 'Arrow and button step; PageUp / PageDown step.' },
            { name: 'format', type: "'number' | 'currency' | 'percent'", default: "'number'", description: 'How the value is displayed and parsed.' },
            { name: 'locale / currency', type: 'string', description: 'BCP 47 tag and ISO 4217 code ("en-IE", "EUR").' },
            { name: 'minimumFractionDigits / maximumFractionDigits', type: 'number', description: 'Override the decimals shown.' },
            { name: 'controls', type: "'inside' | 'attached' | 'none'", default: "'inside'", description: 'Where the − and + buttons go.' },
            { name: 'allowWheel', type: 'boolean', default: 'false', description: 'Change the value with the wheel while focused.' },
            { name: 'holdToRepeat', type: 'boolean', default: 'true', description: 'Repeat and accelerate while a button is held.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: 'incrementLabel / decrementLabel', type: 'string', default: "'Increase' / 'Decrease'", description: 'Accessible names of the buttons.' },
            { name: 'name', type: 'string', description: 'Submits the raw number through a hidden input.' },
            { name: 'groupClassName', type: 'string', description: 'Class for the surrounding group; className goes on the input.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to the input (placeholder, disabled, readOnly, aria-*), including ref.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Up / Down', 'Increase or decrease by one step. Shift makes it ten steps.'],
            ['PageUp / PageDown', 'Increase or decrease by ten steps (or largeStep).'],
            ['Home / End', 'Jump to min / max, when they are set.'],
            ['Enter', 'Commits the typed text. In a form it still submits.'],
            ['Tab', 'Commits on leaving. The − and + buttons are not tab stops.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>The input has <Code>role="spinbutton"</Code> with <Code>aria-valuenow</Code>, <Code>aria-valuemin</Code>, <Code>aria-valuemax</Code> and <Code>aria-valuetext</Code> (the formatted text).</>,
            'Keyboard users and screen readers use the arrow keys; the buttons are for pointers and stay out of the tab order but remain clickable by assistive technology.',
            'Inside a Field the id, aria-describedby, aria-invalid, required and disabled state are wired automatically.',
            'On touch devices the text is 16px, so iOS Safari does not zoom on focus.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Border and ring transition over 150ms; inside buttons press to .94 on the snappy spring.',
            'The number changes instantly: it is the information, so it is not animated.',
            'Reduced motion drops the press scale; hover tints stay on fine pointers only.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
