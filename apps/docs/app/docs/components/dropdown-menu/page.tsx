import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import DropdownMenuAccount from '@/examples/dropdown-menu/account';
import DropdownMenuRowActions from '@/examples/dropdown-menu/row-actions';
import DropdownMenuColumns from '@/examples/dropdown-menu/columns';

export const metadata: Metadata = { title: 'Dropdown menu' };

export default function DropdownMenuPage() {
  return (
    <DocPage href="/docs/components/dropdown-menu">
      <Section id="usage" title="Usage">
        <P>
          Compose <Code>DropdownMenu</Code>, a trigger and the content. Items take an <Code>icon</Code> and a <Code>shortcut</Code>; <Code>variant=&quot;destructive&quot;</Code> colours a risky action. Submenus open to the side on hover or ArrowRight.
        </P>
        <Example component="dropdown-menu" file="dropdown-menu/account" title="Account menu" minHeight={420} align="start">
          <DropdownMenuAccount />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A short list of actions that belong to one control: an account, a row, a toolbar overflow.',
            'Toggles and single-choice options that apply straight away.',
          ]}
        />
        <P>Not for: choosing a value for a form field (use a select), navigation between pages (use links or tabs), or rich content (use a popover).</P>
      </Section>

      <Section id="row-actions" title="Row actions">
        <P>
          An icon-only trigger needs an <Code>aria-label</Code>. Align the menu to the trigger’s edge with <Code>placement=&quot;bottom-end&quot;</Code>; disabled items are skipped by the arrow keys.
        </P>
        <Example component="dropdown-menu" file="dropdown-menu/row-actions" title="Row actions" minHeight={280}>
          <DropdownMenuRowActions />
        </Example>
      </Section>

      <Section id="keep-open" title="Checkbox items that keep it open">
        <P>
          Choosing an item closes the menu. For settings people adjust several at once, call <Code>event.preventDefault()</Code> in <Code>onSelect</Code>.
        </P>
        <Example component="dropdown-menu" file="dropdown-menu/columns" title="Column picker" minHeight={280}>
          <DropdownMenuColumns />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="DropdownMenu"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the menu asks to open or close.' },
          ]}
        />
        <PropsTable
          title="DropdownMenuContent"
          rows={[
            { name: 'placement', type: "'top' | 'right' | 'bottom' | 'left' (+ '-start' | '-end')", default: "'bottom-start'", description: 'Preferred side and alignment.' },
            { name: 'align', type: "'start' | 'center' | 'end'", description: 'Overrides the alignment of placement.' },
            { name: 'offset', type: 'number', default: '6', description: 'Gap to the trigger, px.' },
            { name: 'matchWidth', type: 'boolean', default: 'false', description: 'At least as wide as the trigger.' },
          ]}
        />
        <PropsTable
          title="DropdownMenuItem"
          rows={[
            { name: 'icon', type: 'ReactNode', description: 'Leading 16px icon.' },
            { name: 'shortcut', type: 'ReactNode', description: 'Shortcut hint on the right.' },
            { name: 'variant', type: "'default' | 'destructive'", default: "'default'", description: 'Destructive colours the item red.' },
            { name: 'disabled', type: 'boolean', description: 'Skipped by the arrow keys, cannot be chosen.' },
            { name: 'inset', type: 'boolean', description: 'Indent to line up with checkbox and radio items.' },
            { name: 'onSelect', type: '(event: Event) => void', description: 'Called when chosen. event.preventDefault() keeps the menu open.' },
            { name: 'asChild', type: 'boolean', description: 'Render your own element, e.g. a link.' },
          ]}
        />
        <PropsTable
          title="Checkbox and radio items"
          rows={[
            { name: 'DropdownMenuCheckboxItem checked', type: 'boolean', description: 'Controlled state; also defaultChecked and onCheckedChange.' },
            { name: 'DropdownMenuRadioGroup value', type: 'string', description: 'Controlled value; also defaultValue and onValueChange.' },
            { name: 'DropdownMenuRadioItem value', type: 'string', description: 'The value this item selects.' },
          ]}
        />
        <P>
          Also: <Code>DropdownMenuLabel</Code>, <Code>DropdownMenuSeparator</Code>, <Code>DropdownMenuGroup</Code>, <Code>DropdownMenuSub</Code>, <Code>DropdownMenuSubTrigger</Code> and <Code>DropdownMenuSubContent</Code> (placement defaults to <Code>right-start</Code>).
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space / ↓', 'On the trigger: opens the menu with the first item focused.'],
            ['↑', 'On the trigger: opens the menu with the last item focused.'],
            ['↓ / ↑', 'Next / previous item (wraps around).'],
            ['Home / End', 'First / last item.'],
            ['A–Z', 'Typeahead: jumps to the item that starts with what you type.'],
            ['Enter / Space', 'Chooses the item.'],
            ['→', 'On a submenu item: opens it and focuses its first item.'],
            ['← / Esc', 'In a submenu: closes it. Esc in the main menu closes it and returns focus to the trigger.'],
            ['Tab', 'Closes the menu.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA menu button pattern: role="menu" with menuitem, menuitemcheckbox and menuitemradio items.',
            'The trigger has aria-haspopup="menu", aria-expanded and aria-controls; the menu is labelled by the trigger.',
            'Opened with the keyboard, focus lands on an item; opened with the pointer, on the menu itself. The highlight follows the pointer and the keyboard.',
            'Focus returns to the trigger on close, except after a click outside.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: pops from the trigger side, scale .96, 4px travel (150ms, ease-out).',
            'Close: 160ms fade. Submenus use the same pop from their own side.',
            'Reduced motion: it appears and disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
