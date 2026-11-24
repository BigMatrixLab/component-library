import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import RadioGroupDelivery from '@/examples/radio-group/delivery';
import RadioGroupHorizontal from '@/examples/radio-group/horizontal';
import RadioGroupPlanCards from '@/examples/radio-group/plan-cards';

export const metadata: Metadata = { title: 'Radio group' };

export default function RadioGroupPage() {
  return (
    <DocPage href="/docs/components/radio-group">
      <Section id="basic" title="Basic">
        <P>
          Native radios that share one <Code>name</Code>. The group is a single tab stop; arrow keys move the selection, exactly as in the browser.
        </P>
        <Example component="radio-group" file="radio-group/delivery" title="Delivery speed" align="start">
          <RadioGroupDelivery />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Choosing exactly one option from two to about six, where seeing all options helps the decision.',
            'Options that need a short description, such as delivery speed or a billing period.',
          ]}
        />
        <P>Not for: more than about six options (use a select), or independent yes/no choices (use checkboxes).</P>
      </Section>

      <Section id="horizontal" title="Horizontal">
        <P>
          <Code>orientation=&quot;horizontal&quot;</Code> lays the options in a row that wraps on narrow screens. Individual items can be disabled.
        </P>
        <Example component="radio-group" file="radio-group/horizontal" title="Billing period" align="start">
          <RadioGroupHorizontal />
        </Example>
      </Section>

      <Section id="cards" title="Radio cards">
        <P>
          <Code>variant=&quot;card&quot;</Code> makes each option a card. One selection ring is measured to the checked card and glides between them on the morph spring.
        </P>
        <Example component="radio-group" file="radio-group/plan-cards" title="Plan picker" align="start">
          <RadioGroupPlanCards />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="RadioGroup"
          rows={[
            { name: 'value', type: 'string', description: 'Controlled value.' },
            { name: 'defaultValue', type: 'string', description: 'Initial value when uncontrolled.' },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the selection changes.' },
            { name: 'name', type: 'string', description: 'Shared name of the native radios (generated if omitted).' },
            { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction.' },
            { name: 'variant', type: "'default' | 'card'", default: "'default'", description: 'Card shows bordered options with a gliding ring.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Circle size: 16 / 20 / 24px.' },
            { name: 'disabled / required / invalid', type: 'boolean', description: 'Applied to every item.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the group, including aria-label.' },
          ]}
        />
        <PropsTable
          title="RadioGroupItem"
          rows={[
            { name: 'value', type: 'string', description: 'Required. The value this option represents.' },
            { name: 'label', type: 'ReactNode', description: 'Visible label. Without one, pass aria-label.' },
            { name: 'description', type: 'ReactNode', description: 'Secondary text; wired with aria-describedby.' },
            { name: 'disabled', type: 'boolean', description: 'Skips this option for focus and selection.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to the <input type="radio">, including ref.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves focus into the group (to the selected option, or the first) and out again.'],
            ['↓ / →', 'Selects and focuses the next option, wrapping at the end.'],
            ['↑ / ←', 'Selects and focuses the previous option, wrapping at the start.'],
            ['Space', 'Selects the focused option if it is not already selected.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="radiogroup" around native radios: roving tab stop, arrow keys and “2 of 3” announcements come from the browser.',
            'Give the group an aria-label or aria-labelledby; each item has its own label.',
            'Disabled items are skipped by arrow keys. Invalid sets aria-invalid on every radio.',
            'Keyboard focus shows a 3px ring on the circle (or around the card).',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The dot scales in on the snappy spring; the circle fills with the control colour.',
            'Cards: the selection ring is one element, translated and resized to the checked card with the morph spring (550ms). It is placed without animation on first paint and on resize.',
            'Reduced motion: the ring jumps to the new card; colours still change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
