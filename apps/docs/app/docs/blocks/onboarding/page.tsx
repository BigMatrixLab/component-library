import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import OnboardingGettingStarted from '@/examples/blocks/onboarding/getting-started';
import OnboardingSplitWelcome from '@/examples/blocks/onboarding/split-welcome';
import OnboardingWizard from '@/examples/blocks/onboarding/wizard';

export const metadata: Metadata = { title: 'Onboarding block' };

export default function OnboardingBlockPage() {
  return (
    <DocPage href="/docs/blocks/onboarding" wide>
      <Section id="wizard" title="First-run wizard">
        <P>
          Three steps behind a <Code>Stepper</Code>: name the workspace and its address, invite teammates with a{' '}
          <Code>TagInput</Code>, then pick a plan and an accent colour. Each step is its own form, so Enter continues, and
          a soft check closes the flow with a summary.
        </P>
        <Example component="blocks/onboarding" file="blocks/onboarding/wizard" title="First-run wizard" align="stretch" minHeight={720}>
          <OnboardingWizard />
        </Example>
      </Section>

      <Section id="getting-started" title="Getting started home">
        <P>
          The page people land on after the wizard: a welcome card with the trial meter, an <Code>OnboardingChecklist</Code>{' '}
          driven by the app, an empty deployments card whose actions tick the checklist, and quick links.
        </P>
        <Example
          component="blocks/onboarding"
          file="blocks/onboarding/getting-started"
          title="Getting started home"
          align="stretch"
          minHeight={820}
        >
          <OnboardingGettingStarted />
        </Example>
      </Section>

      <Section id="split-welcome" title="Split welcome with progress">
        <P>
          A two-panel welcome: the brand panel on the left, one question at a time on the right with a progress bar.
          Below 48rem of width the panel becomes a header and the perks list is hidden.
        </P>
        <Example
          component="blocks/onboarding"
          file="blocks/onboarding/split-welcome"
          title="Split welcome with progress"
          align="stretch"
          minHeight={640}
        >
          <OnboardingSplitWelcome />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Wizard: the first minute after sign-up, when a few answers are needed before anything works (a name, an address).',
            'Getting started home: the days after, when setup happens in the real product and the checklist follows along.',
            'Split welcome: optional questions that shape defaults. Always offer a way to skip.',
            'Not for: long forms (use a settings page), or anything people repeat often (a wizard slows them down).',
          ]}
        />
        <P>Keep it to three to five steps. Ask only for what the next screen needs; everything else can wait for Settings.</P>
      </Section>

      <Section id="behaviour" title="Behaviour">
        <List
          items={[
            'The workspace address follows the name until it is edited by hand. Errors show after the first Continue, then update as you type.',
            'Completed steps in the stepper are buttons that go back; later steps stay disabled until reached.',
            'Invites: Enter or comma adds an address, a paste adds a list. An invalid address stays in the field with an error and blocks Continue.',
            'The accent colour previews live: the block sets data-accent on its own root, so only the block recolours.',
            'Getting started: “Deploy a template” in the empty state ticks the checklist step too. Once every step is done the checklist offers Dismiss.',
            'Split welcome: each question needs an answer before Continue; “Skip for now” jumps to the end with the standard dashboard.',
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter', 'Continue to the next step (in a text field); adds an address in the invite field.'],
            ['Tab', 'Moves through fields and actions; in the invite field it first adds the typed address.'],
            ['Arrow keys', 'Move between completed steps in the stepper, and between options in a radio group.'],
            ['Space', 'Ticks a checklist step or a goal checkbox.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>The stepper is an ordered list; the current step has <Code>aria-current=&quot;step&quot;</Code> and done steps say “(completed)”.</>,
            'When the step changes, focus moves to the new step’s heading so screen readers hear where they are. It does not move on first load.',
            <>Errors use <Code>FieldError</Code> (role alert) and mark the control <Code>aria-invalid</Code>; the first invalid field gets focus.</>,
            'Radio and checkbox groups are named by their visible question or label.',
            'The checklist progress ring and the trial meter are progressbars with a text value (“2 of 5 steps complete”).',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Each step rises in with <Code>ui-animate-rise</Code>; the stepper line fills on the smooth spring and the check draws in.</>,
            <>The finish screen staggers in with <Code>ui-stagger</Code>: a success disc with a soft halo, the heading, the summary.</>,
            'Reduced motion: content appears in place, nothing moves.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
