import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import NativeSelectBasic from '@/examples/native-select/basic';
import NativeSelectSizes from '@/examples/native-select/sizes';
import NativeSelectStates from '@/examples/native-select/states';

export const metadata: Metadata = { title: 'Native select' };

export default function NativeSelectPage() {
  return (
    <DocPage href="/docs/components/native-select">
      <Section id="usage" title="Usage">
        <P>
          The browser’s own <Code>&lt;select&gt;</Code>, styled to match the input, with a chevron. You keep everything native: the large touch pickers on phones, type-ahead, form submission and autofill. Use plain <Code>&lt;option&gt;</Code> and <Code>&lt;optgroup&gt;</Code> children.
        </P>
        <Example component="native-select" file="native-select/basic" title="Native select">
          <NativeSelectBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A short or medium list where the platform picker is the best experience: country, time zone, billing period.',
            'Forms that must work well on phones, with no custom popup to maintain.',
          ]}
        />
        <P>Not for: lists that need search, icons, multi-select chips or custom option layouts (use a custom select or combobox).</P>
      </Section>

      <Section id="sizes" title="Sizes">
        <P>32, 36 and 44px tall, matching the input. On touch devices the text is 16px so iOS Safari does not zoom on focus.</P>
        <Example component="native-select" file="native-select/sizes" title="Native select sizes">
          <NativeSelectSizes />
        </Example>
      </Section>

      <Section id="states" title="States and groups">
        <P>
          An option with an empty <Code>value</Code> that is selected reads as a placeholder. Use <Code>optgroup</Code> to group long lists.
        </P>
        <Example component="native-select" file="native-select/states" title="Native select states">
          <NativeSelectStates />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="NativeSelect"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 32 / 36 / 44px.' },
            { name: 'wrapperClassName', type: 'string', description: 'Class for the wrapper around the select and chevron (width, margins).' },
            { name: '...props', type: 'SelectHTMLAttributes', description: 'Forwarded to <select>, including ref, value, defaultValue, onChange, disabled, multiple.' },
          ]}
        />
        <P>In plain HTML: <Code>ui-select-wrap</Code> around <Code>ui-select</Code> and an icon with <Code>ui-select-icon</Code>.</P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <P>Native behaviour; it differs slightly per browser and platform.</P>
        <KeyTable
          rows={[
            ['Space / Enter / Alt + Down', 'Opens the list.'],
            ['Up / Down', 'Changes the selected option.'],
            ['Type a letter', 'Jumps to the next option starting with it.'],
            ['Esc', 'Closes the list.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A real select element: role, value, expanded state and screen reader announcements are native.',
            'The chevron is decorative and does not intercept clicks.',
            'Inside a Field the id, description, invalid and required state are wired automatically.',
            'Without a visible label, give the select an aria-label.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Border, ring and chevron colour transition over 150ms. The open list is drawn by the browser.',
            'Reduced motion keeps the colour change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
