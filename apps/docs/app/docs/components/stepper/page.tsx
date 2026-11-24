import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import StepperCheckout from '@/examples/stepper/checkout';
import StepperVertical from '@/examples/stepper/vertical';

export const metadata: Metadata = { title: 'Stepper' };

export default function StepperPage() {
  return (
    <DocPage href="/docs/components/stepper">
      <Section id="usage" title="Usage">
        <P>
          Steps before <Code>value</Code> are complete (the number turns into a check that draws in and the line to the next step fills), <Code>value</Code> is the current step and the rest are upcoming. Passing <Code>onValueChange</Code> makes the steps buttons.
        </P>
        <Example component="stepper" file="stepper/checkout" title="Checkout" align="stretch">
          <StepperCheckout />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Flows with a known, short sequence of steps: checkout, onboarding, setup.',
            'Showing where something is in a process it moves through by itself, such as order tracking.',
          ]}
        />
        <P>Not for: switching between views (use tabs), or more than about six steps (group them).</P>
      </Section>

      <Section id="vertical" title="Vertical">
        <P>
          <Code>{'orientation="vertical"'}</Code> stacks the steps and draws the line downwards. Without <Code>onValueChange</Code> the steps are plain text, not buttons.
        </P>
        <Example component="stepper" file="stepper/vertical" title="Order tracking" align="start">
          <StepperVertical />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Stepper"
          rows={[
            { name: 'value', type: 'number', description: 'Current step, 1-based. Controlled.' },
            { name: 'defaultValue', type: 'number', default: '1', description: 'Initial step when uncontrolled.' },
            { name: 'onValueChange', type: '(value: number) => void', description: 'Called when a step is chosen. Makes the steps clickable.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction.' },
            { name: 'clickable', type: 'boolean', description: 'Force steps to be buttons (default: true when onValueChange is set).' },
          ]}
        />
        <PropsTable
          title="StepperItem"
          rows={[
            { name: 'step', type: 'number', description: 'This step’s number, 1-based.' },
            { name: 'state', type: "'complete' | 'current' | 'upcoming'", description: 'Override the state worked out from value.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Not selectable (clickable steppers only).' },
          ]}
        />
        <P>
          Parts: <Code>StepperTrigger</Code> (the pressable area), <Code>StepperIndicator</Code>, <Code>StepperContent</Code>, <Code>StepperTitle</Code>, <Code>StepperDescription</Code> and <Code>StepperSeparator</Code>. Leave the separator off the last step.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves to the steps that can be selected.'],
            ['← →', 'Between steps (↑ ↓ when vertical).'],
            ['Home / End', 'First / last selectable step.'],
            ['Enter / Space', 'Goes to the focused step.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'An ordered list; the current step has aria-current="step".',
            'Completed steps add a hidden “(completed)” to their title; the indicator itself is decorative.',
            'Upcoming steps in a checkout should be disabled so people cannot skip ahead.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The check draws in over 320ms; the indicator fills with colour.',
            'The line between steps fills on the smooth spring (no overshoot).',
            'Reduced motion keeps the state change and drops the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
