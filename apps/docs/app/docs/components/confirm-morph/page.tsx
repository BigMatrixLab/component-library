import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ConfirmMorphDeleteFiles from '@/examples/confirm-morph/delete-files';
import ConfirmMorphFailure from '@/examples/confirm-morph/failure';

export const metadata: Metadata = { title: 'Confirm morph' };

export default function ConfirmMorphPage() {
  return (
    <DocPage href="/docs/components/confirm-morph">
      <Section id="delete-files" title="Delete files">
        <P>Click the button. It turns, in place, into “Delete 3 files? Cancel / Delete”, then a spinner, then a result with Undo. Nothing opens elsewhere, so the user never loses the thing they clicked.</P>
        <Example component="confirm-morph" file="confirm-morph/delete-files" title="Delete files">
          <ConfirmMorphDeleteFiles />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Destructive actions in a toolbar, table row or card, where a modal would pull attention away from context.',
            'When the action can be undone for a short while — pass onUndo and the result carries an Undo button.',
            <>For irreversible, high-stakes actions use a dialog or <Code>HoldToConfirm</Code>.</>,
          ]}
        />
      </Section>

      <Section id="failure" title="Failure and retry">
        <P>If <Code>onConfirm</Code> rejects, the box shows the error with Cancel and Retry. The first attempt below fails. This one uses the large size (44px).</P>
        <Example component="confirm-morph" file="confirm-morph/failure" title="Failure and retry">
          <ConfirmMorphFailure />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ConfirmMorph"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'Label of the destructive button: "Delete 3 files".' },
            { name: 'question', type: 'ReactNode', description: 'The inline question: "Delete 3 files?".' },
            { name: 'onConfirm', type: '() => unknown | Promise<unknown>', description: 'Runs on confirm. A rejection shows the error phase.' },
            { name: 'onUndo', type: '() => unknown | Promise<unknown>', description: 'Adds Undo to the result.' },
            { name: 'undoWindow', type: 'number', default: '6000', description: 'Milliseconds the result stays before returning to idle (1600 when there is no Undo).' },
            { name: 'confirmLabel / cancelLabel / pendingLabel / resultLabel / errorLabel / undoLabel / retryLabel', type: 'ReactNode', description: 'All copy is overridable. Defaults: Delete, Cancel, Deleting…, Deleted, Couldn’t delete, Undo, Retry.' },
            { name: 'icon', type: 'ReactNode', description: 'Icon before the label.' },
            { name: 'phase / defaultPhase / onPhaseChange', type: "'idle' | 'confirm' | 'pending' | 'done' | 'error'", default: "'idle'", description: 'Controlled or uncontrolled phase.' },
            { name: 'size', type: "'md' | 'lg'", default: "'md'", description: 'Height 36 / 44px.' },
            { name: 'disabled', type: 'boolean', description: 'Disables the starting button.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'Activates the focused button.'],
            ['Esc', 'Cancels the confirmation (or dismisses an error) and returns focus to the starting button.'],
            ['Tab', 'Moves between Cancel and Delete.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Focus follows the interaction: Cancel (the safe choice) when asking, a neutral spot while pending, Undo or Retry on a result, the starting button after Esc or Cancel.',
            'Focus only moves when it was already inside the component, so a background update never steals it.',
            'A polite live region announces the question, the pending label and the result.',
            'The outgoing layer of a morph is inert, so nothing duplicated can be focused.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>One box: its width springs to each phase on <Code>--ui-spring-morph</Code> (550ms) via the Web Animations API; colours move over 220ms.</>,
            'Content: the new layer rises 4px with a 2px blur that clears (220ms); the old layer lifts and blurs out (160ms) on top of it.',
            'The button is destructive red → raised surface (confirm) → muted (pending) → raised with a drawn success check (done).',
            'Reduced motion: width and content swap instantly (1ms fade), the colours still change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
