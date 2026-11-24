import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AlertDialogDestructive from '@/examples/alert-dialog/destructive';
import AlertDialogTypeToConfirm from '@/examples/alert-dialog/type-to-confirm';
import AlertDialogAsyncConfirm from '@/examples/alert-dialog/async-confirm';

export const metadata: Metadata = { title: 'Alert dialog' };

export default function AlertDialogPage() {
  return (
    <DocPage href="/docs/components/alert-dialog">
      <Section id="usage" title="Usage">
        <P>
          An alert dialog interrupts to ask for a decision that is hard to undo. It is not a separate component: it is a <Code>Dialog</Code> with <Code>role=&quot;alertdialog&quot;</Code> and <Code>dismissible={'{false}'}</Code>, with <Code>Button</Code>s in the footer. Esc and the overlay no longer close it, so the person has to choose.
        </P>
        <Example component="alert-dialog" file="alert-dialog/destructive" title="Destructive confirmation">
          <AlertDialogDestructive />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Deleting, revoking or overwriting something that cannot be recovered.',
            'Leaving a flow that would lose unsaved work.',
          ]}
        />
        <P>Not for: routine confirmations (prefer undo with a toast), forms (use a dialog or a sheet), information (use an alert).</P>
      </Section>

      <Section id="rules" title="Writing the confirmation">
        <List
          items={[
            'The title is the question: “Revoke Production key?”, not “Are you sure?”.',
            'The description says what is lost and whether it can be undone.',
            'Label buttons with the action (“Revoke key”), never “Yes” / “No”.',
            'Put the safe choice first in the tab order and give it focus; the destructive button uses the destructive variant.',
            'One destructive action per dialog.',
          ]}
        />
      </Section>

      <Section id="type-to-confirm" title="Type to confirm">
        <P>
          For the most damaging actions, make the person type the project name. The confirm button stays disabled until it matches, and the field is cleared when the dialog closes.
        </P>
        <Example component="alert-dialog" file="alert-dialog/type-to-confirm" title="Type to confirm">
          <AlertDialogTypeToConfirm />
        </Example>
      </Section>

      <Section id="async" title="Async confirmation">
        <P>
          When confirming starts a request, keep the dialog open: set <Code>loading</Code> on the confirm button, disable Cancel, ignore close requests while pending, and show a failure in place with a retry. Close only after it succeeds.
        </P>
        <Example component="alert-dialog" file="alert-dialog/async-confirm" title="Async confirmation">
          <AlertDialogAsyncConfirm />
        </Example>
      </Section>

      <Section id="api" title="API">
        <P>
          There is nothing new to learn: see <Code>Dialog</Code>. The relevant props are <Code>role=&quot;alertdialog&quot;</Code>, <Code>dismissible={'{false}'}</Code> and <Code>showClose={'{false}'}</Code> on <Code>DialogContent</Code>, plus <Code>loading</Code> on <Code>Button</Code>. Use a controlled dialog (<Code>open</Code> / <Code>onOpenChange</Code>) when the confirm action is asynchronous.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Esc', 'Does nothing: an alert dialog must be answered.'],
            ['Tab', 'Moves focus between the dialog controls; it never leaves the dialog.'],
            ['Enter / Space', 'Activates the focused button.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA alert dialog pattern: role="alertdialog" with a title and a description.',
            'The page behind is inert and focus is contained; focus returns to the trigger on close.',
            'Errors that appear inside use role="alert" so they are announced.',
            'The destructive colour is never the only signal: the button label names the action.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The same soft rise as Dialog: the panel rises 8px, scales from .96 and un-blurs (380ms), and leaves in 160ms.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
