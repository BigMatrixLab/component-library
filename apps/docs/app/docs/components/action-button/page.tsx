import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ActionButtonSaveDraft from '@/examples/action-button/save-draft';
import ActionButtonRetry from '@/examples/action-button/retry';

export const metadata: Metadata = { title: 'Action button' };

export default function ActionButtonPage() {
  return (
    <DocPage href="/docs/components/action-button">
      <Section id="save-draft" title="Save draft">
        <P>A button that tells you what is happening to it. Click one: the label morphs from the action to its progress to its result, and the width springs to fit each word.</P>
        <Example component="action-button" file="action-button/save-draft" title="Save draft">
          <ActionButtonSaveDraft />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A single async action whose result the user wants confirmed in place: Save draft, Send invoice, Sync.',
            'Anywhere a toast would be too far from the thing that was clicked.',
            <>For long or cancellable work use a progress bar; for a plain spinner on a button use <Code>Button loading</Code>.</>,
          ]}
        />
      </Section>

      <Section id="errors" title="Errors and retry">
        <P>A rejected promise shows the error state and returns to idle after 1.6 seconds, so the next click is a retry. The first click below fails on purpose.</P>
        <Example component="action-button" file="action-button/retry" title="Errors and retry">
          <ActionButtonRetry />
        </Example>
      </Section>

      <Section id="controlled" title="Controlled state">
        <P>
          Pass <Code>state</Code> and <Code>onStateChange</Code> to drive the button from your own mutation (for example a React Query status). Success and error still ask for idle after <Code>resetAfter</Code> milliseconds through <Code>onStateChange</Code>.
        </P>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ActionButton"
          rows={[
            { name: 'onAction', type: '() => unknown | Promise<unknown>', description: 'Runs on click. A promise drives pending → success (resolved) or error (rejected).' },
            { name: 'state', type: "'idle' | 'pending' | 'success' | 'error'", description: 'Controlled state. Omit to let onAction drive it.' },
            { name: 'onStateChange', type: '(state) => void', description: 'Called on every change, controlled or not.' },
            { name: 'pendingLabel', type: 'ReactNode', default: "'Working…'", description: 'Label while pending.' },
            { name: 'successLabel', type: 'ReactNode', default: "'Done'", description: 'Label after success.' },
            { name: 'errorLabel', type: 'ReactNode', default: "'Failed'", description: 'Label after a failure.' },
            { name: 'resetAfter', type: 'number', default: '1600', description: 'Milliseconds before success / error return to idle. 0 keeps the result.' },
            { name: 'idleIcon', type: 'ReactNode', description: 'Icon before the idle label.' },
            { name: 'variant, size', type: 'ButtonProps', description: 'Same as Button: 28 / 32 / 36 / 44px and every variant.' },
            { name: '...props', type: 'ButtonProps', description: 'Forwarded to Button, including ref, disabled and onClick (runs before onAction).' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Enter', 'Runs the action.'], ['Space', 'Runs the action.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native button that keeps focus through every state — it is never disabled mid-action.',
            'While pending it sets aria-busy and ignores clicks.',
            'A polite live region announces the pending, success and error labels, so the morph is not only visual.',
            'Success and error colours (success / destructive fill with their foreground) keep 4.5:1 contrast, and the icon and label carry the meaning too.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Width: measured before and after, then animated with the Web Animations API on <Code>--ui-spring-morph</Code> (550ms, slight settle). Interrupting mid-morph starts from the width on screen.</>,
            'Labels: the new label rises 4px with a 2px blur that clears (220ms, ease-out); the old one lifts 4px and blurs out (160ms, ease-in) over the top of it.',
            'Icons: the spinner is a 14px ring; the check draws itself in 320ms; the cross pops in. The fill turns success or destructive over 150ms.',
            'Reduced motion: no width spring, no blur or movement. The label swaps with a 1ms fade, the colour still changes and the live region still announces.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
