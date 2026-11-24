import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import OnboardingChecklistWorkspace from '@/examples/onboarding-checklist/workspace';
import OnboardingChecklistAppDriven from '@/examples/onboarding-checklist/app-driven';

export const metadata: Metadata = { title: 'Onboarding checklist' };

export default function OnboardingChecklistPage() {
  return (
    <DocPage href="/docs/components/onboarding-checklist">
      <Section id="workspace" title="Checklist">
        <P>
          Setup steps in a card, with a progress ring. Tick a step (the box or its title) and the check draws itself. Tick them all for a small celebration. The chevron folds the steps away.
        </P>
        <Example component="onboarding-checklist" file="onboarding-checklist/workspace" title="Checklist">
          <OnboardingChecklistWorkspace />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'First-run setup with a handful of steps (3–7) a new user should finish.',
            'Guiding people to the actions that make a product useful: invite the team, connect data, publish.',
          ]}
        />
        <P>Not for: a linear form split over pages (use a stepper), a to-do list the user edits (use checkboxes), progress of a running task (use Progress).</P>
      </Section>

      <Section id="app-driven" title="Steps the app completes">
        <P>
          With <Code>checkable={'{false}'}</Code> the circles are indicators only and your app marks steps done through <Code>value</Code>. Here each step’s button completes it. <Code>progress="bar"</Code> puts the bar under the title; <Code>onDismiss</Code> adds a Dismiss button once everything is done.
        </P>
        <Example component="onboarding-checklist" file="onboarding-checklist/app-driven" title="Steps the app completes">
          <OnboardingChecklistAppDriven />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="OnboardingChecklist"
          rows={[
            { name: 'title', type: 'ReactNode', description: 'Card heading; names the section.' },
            { name: 'description', type: 'ReactNode', description: 'Line under the title.' },
            { name: 'steps', type: '{ id; title; description?; action?; disabled?; checkable? }[]', description: 'The steps, in order. action shows while the step is not done.' },
            { name: 'value', type: 'string[]', description: 'Controlled: ids of completed steps.' },
            { name: 'defaultValue', type: 'string[]', default: '[]', description: 'Initial completed ids when uncontrolled.' },
            { name: 'onValueChange', type: '(value: string[]) => void', description: 'New completed ids, in step order.' },
            { name: 'onComplete', type: '() => void', description: 'Called once when the last step is completed (never on mount).' },
            { name: 'checkable', type: 'boolean', default: 'true', description: 'Users can tick steps. false = the app marks them done.' },
            { name: 'collapsible', type: 'boolean', default: 'true', description: 'Header button that folds the steps away.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', default: 'defaultOpen true', description: 'Whether the steps are shown.' },
            { name: 'progress', type: "'ring' | 'bar'", default: "'ring'", description: '40px ring beside the title or a bar under it.' },
            { name: 'completeTitle / completeDescription', type: 'ReactNode', description: 'Header text once every step is done.' },
            { name: 'onDismiss', type: '() => void', description: 'Shows a Dismiss button in the finished state.' },
            { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'Heading level of the title.' },
            { name: 'labels', type: '{ progress?; count?; allComplete?; completed?; dismiss? }', description: 'Text for i18n.' },
          ]}
        />
        <P>
          Data attributes: <Code>data-state</Code> (<Code>open | closed</Code>), <Code>data-complete</Code> and <Code>data-celebrate</Code> on the card; each step has <Code>data-state</Code> (<Code>complete | incomplete</Code>) and <Code>data-current</Code> on the next one to do.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves through the collapse button, each step’s checkbox and its action.'],
            ['Space', 'Ticks or unticks the focused step.'],
            ['Enter / Space', 'On the collapse button, shows or hides the steps.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A section named by its title; the steps are an ordered list.',
            'Each step is a native checkbox labelled by the step title and described by its description.',
            'The collapse button follows the disclosure pattern (aria-expanded, aria-controls).',
            'The progress ring or bar is a progressbar with “2 of 5 steps complete” as its value text; finishing is announced through a polite status region.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Ticking: the disc grows on the morph spring, then the check draws (320ms). Unticking reverses faster. Done titles fade to muted with a strike.',
            'Finishing: the ring pops, a soft success halo spreads, the check in the ring draws and the new title rises in — once.',
            'Collapsing uses the accordion’s height animation.',
            'Reduced motion: states change instantly; no celebration.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
