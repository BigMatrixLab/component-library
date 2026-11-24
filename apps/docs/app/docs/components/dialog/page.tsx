import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import DialogEditProfile from '@/examples/dialog/edit-profile';
import DialogConfirm from '@/examples/dialog/confirm';
import DialogScrolling from '@/examples/dialog/scrolling';

export const metadata: Metadata = { title: 'Dialog' };

export default function DialogPage() {
  return (
    <DocPage href="/docs/components/dialog">
      <Section id="usage" title="Usage">
        <P>
          Compose <Code>Dialog</Code>, a trigger and the content. It is built on the native <Code>&lt;dialog&gt;</Code>, so the top layer, focus containment and an inert page come from the browser. It opens with the soft rise and closes with a quick fade.
        </P>
        <Example component="dialog" file="dialog/edit-profile" title="Edit profile">
          <DialogEditProfile />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A decision or short task that must be finished or cancelled before going on.',
            'Confirming something destructive (use role="alertdialog").',
          ]}
        />
        <P>Not for: long forms or browsing (use a page or a sheet), non-blocking messages (use a toast), small contextual info (use a popover).</P>
      </Section>

      <Section id="confirm" title="Confirmation">
        <P>
          For destructive actions use <Code>role=&quot;alertdialog&quot;</Code> with <Code>dismissible={'{false}'}</Code>: Esc and the backdrop no longer close it, so the person has to choose. This example is controlled and keeps the dialog open while the delete runs.
        </P>
        <Example component="dialog" file="dialog/confirm" title="Confirmation">
          <DialogConfirm />
        </Example>
      </Section>

      <Section id="scrolling" title="Long content">
        <P>Give the body a max height and let it scroll; the header and footer stay put.</P>
        <Example component="dialog" file="dialog/scrolling" title="Long content">
          <DialogScrolling />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Dialog"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the dialog asks to open or close.' },
          ]}
        />
        <PropsTable
          title="DialogContent"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Panel width: 384 / 512 / 672 / 896px or full.' },
            { name: 'dismissible', type: 'boolean', default: 'true', description: 'Close on Esc and on a backdrop click.' },
            { name: 'showClose', type: 'boolean', default: 'true', description: 'The × button in the corner.' },
            { name: 'centered', type: 'boolean', default: 'false', description: 'Stay centred on phones instead of docking to the bottom.' },
            { name: 'role', type: "'dialog' | 'alertdialog'", default: "'dialog'", description: 'Use alertdialog for confirmations.' },
            { name: 'panelClassName', type: 'string', description: 'Classes for the card. className styles the overlay layer.' },
          ]}
        />
        <P>
          <Code>DialogTrigger</Code> and <Code>DialogClose</Code> are buttons; pass <Code>asChild</Code> to use your own. <Code>DialogHeader</Code>, <Code>DialogTitle</Code>, <Code>DialogDescription</Code>, <Code>DialogBody</Code> and <Code>DialogFooter</Code> are layout parts.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Esc', 'Closes the dialog (unless dismissible is false).'],
            ['Tab', 'Moves focus to the next element inside the dialog.'],
            ['Shift + Tab', 'Moves focus to the previous element inside the dialog.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA modal dialog pattern; the page behind is inert.',
            'The title and description are wired to aria-labelledby / aria-describedby when present.',
            'Focus moves to the first [autofocus] field, otherwise the panel, and returns to the trigger on close.',
            'Page scroll is locked while open, without layout shift from the scrollbar.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: the overlay fades in (220ms) while the panel rises 8px, scales from .96 and un-blurs (380ms, ease-out).',
            'Close: both fade out in 160ms; the dialog unmounts only after the animation ends.',
            'Phones: the panel docks to the bottom edge and rises 24px.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
