import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TabsAccount from '@/examples/tabs/account';
import TabsAnalytics from '@/examples/tabs/analytics';
import TabsVariants from '@/examples/tabs/variants';
import TabsVertical from '@/examples/tabs/vertical';
import TabsScrollable from '@/examples/tabs/scrollable';

export const metadata: Metadata = { title: 'Tabs' };

export default function TabsPage() {
  return (
    <DocPage href="/docs/components/tabs">
      <Section id="usage" title="Usage">
        <P>
          Compose <Code>Tabs</Code>, a <Code>TabsList</Code> of <Code>TabsTrigger</Code>s and one <Code>TabsContent</Code> per trigger, matched by <Code>value</Code>. A single indicator glides between the triggers; the panel rises in when you switch.
        </P>
        <Example component="tabs" file="tabs/account" title="Account settings" align="start">
          <TabsAccount />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Peer views of the same thing that you switch between often: account and password, day and week.',
            'Views that each fit on one screen and do not need to be compared side by side.',
          ]}
        />
        <P>Not for: steps that must happen in order (use a stepper), page navigation (use links or a nav menu), long documents (use headings).</P>
      </Section>

      <Section id="variants" title="Variants">
        <P>
          <Code>segmented</Code> (default) is a raised pill on a muted track, <Code>underline</Code> is a bar under the active tab, <Code>pills</Code> is a soft fill with no track. A disabled trigger is skipped by the arrow keys.
        </P>
        <Example component="tabs" file="tabs/variants" title="Variants" align="start">
          <TabsVariants />
        </Example>
        <Example component="tabs" file="tabs/analytics" title="Period tabs" align="start">
          <TabsAnalytics />
        </Example>
      </Section>

      <Section id="vertical" title="Vertical and manual activation">
        <P>
          <Code>orientation=&quot;vertical&quot;</Code> stacks the list and moves with Up / Down. With <Code>activationMode=&quot;manual&quot;</Code> the arrow keys only move focus and Enter or Space opens the tab, which suits panels that are slow to render.
        </P>
        <Example component="tabs" file="tabs/vertical" title="Vertical, manual activation" align="start">
          <TabsVertical />
        </Example>
      </Section>

      <Section id="overflow" title="Narrow screens">
        <P>When the triggers do not fit, the list scrolls sideways and the active tab is kept in view.</P>
        <Example component="tabs" file="tabs/scrollable" title="Scrolling list" align="start">
          <TabsScrollable />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Tabs"
          rows={[
            { name: 'value', type: 'string', description: 'Controlled selected tab.' },
            { name: 'defaultValue', type: 'string', description: 'Initially selected tab when uncontrolled.' },
            { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the selected tab changes.' },
            { name: 'variant', type: "'segmented' | 'underline' | 'pills'", default: "'segmented'", description: 'Visual style of the list and its indicator.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Axis of the list and of the arrow keys.' },
            { name: 'activationMode', type: "'automatic' | 'manual'", default: "'automatic'", description: 'Select on focus, or wait for Enter / Space.' },
          ]}
        />
        <PropsTable
          title="TabsTrigger"
          rows={[
            { name: 'value', type: 'string', description: 'Required. Matches a TabsContent.' },
            { name: 'disabled', type: 'boolean', description: 'Skipped by keyboard and clicks.' },
          ]}
        />
        <PropsTable
          title="TabsContent"
          rows={[
            { name: 'value', type: 'string', description: 'Required. Shown while its trigger is selected.' },
            { name: 'forceMount', type: 'boolean', default: 'false', description: 'Keep the panel in the DOM, hidden, while inactive (preserves form state).' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves into the list (to the selected tab), then to the open panel.'],
            ['← / →', 'Previous / next tab in a horizontal list; wraps around.'],
            ['↑ / ↓', 'Previous / next tab in a vertical list; wraps around.'],
            ['Home / End', 'First / last tab.'],
            ['Enter / Space', 'Opens the focused tab (manual activation).'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA tabs pattern: tablist, tab with aria-selected and aria-controls, tabpanel with aria-labelledby.',
            'Roving tabindex: only the selected tab is in the Tab order.',
            'Give the list an aria-label when the purpose of the tabs is not obvious from the page.',
            'The indicator is decorative and hidden from assistive technology.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The indicator glides between triggers on the morph spring (position and size), never on the first render.',
            'The indicator is placed after mount, so server-rendered markup does not jump: until then the active trigger is styled itself.',
            'The new panel rises in over 220ms; the first panel shown on load does not animate.',
            'Reduced motion: the indicator and panel change without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
