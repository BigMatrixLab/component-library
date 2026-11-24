import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TagInputRecipients from '@/examples/tag-input/recipients';
import TagInputSkills from '@/examples/tag-input/skills';

export const metadata: Metadata = { title: 'Tag input' };

export default function TagInputPage() {
  return (
    <DocPage href="/docs/components/tag-input">
      <Section id="usage" title="Usage">
        <P>
          A field that turns text into removable chips. It looks like our <Code>Input</Code> and grows taller as chips wrap. The value is a string array.
        </P>
        <Example component="tag-input" file="tag-input/recipients" title="Email recipients">
          <TagInputRecipients />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Free-form lists of short values: recipients, keywords, labels, domains.',
            'Add a validate function when only some text is acceptable (emails, slugs).',
          ]}
        />
        <P>Not for: choosing from a fixed set (use a select or a combobox), or values with long text (use a textarea).</P>
      </Section>

      <Section id="adding" title="Adding and removing">
        <List
          items={[
            <><Code>Enter</Code>, <Code>Tab</Code> or a comma adds the text. Leaving the field adds it too (<Code>addOnBlur</Code>).</>,
            'Pasting splits on commas and new lines, so a whole list becomes chips at once.',
            <>A duplicate is refused: the existing chip shakes and a screen reader hears why. <Code>maxTags</Code> and <Code>validate</Code> refuse the same way, and <Code>onTagRejected</Code> tells you.</>,
            <><Code>Backspace</Code> on empty text highlights the last chip; a second press removes it. The × on a chip removes that one.</>,
          ]}
        />
      </Section>

      <Section id="suggestions" title="Suggestions">
        <P>
          Pass <Code>suggestions</Code> for a floating list. It filters as you type, hides tags already added, and follows the combobox pattern: arrows move the highlight, Enter picks, Escape closes.
        </P>
        <Example component="tag-input" file="tag-input/skills" title="Skills with suggestions">
          <TagInputSkills />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="TagInput"
          rows={[
            { name: 'value / defaultValue', type: 'string[]', default: '[]', description: 'Controlled / initial tags.' },
            { name: 'onValueChange', type: '(tags: string[]) => void', description: 'Called when a tag is added or removed.' },
            { name: 'maxTags', type: 'number', description: 'Most tags allowed.' },
            { name: 'validate', type: '(tag, tags) => boolean | string', description: 'Return true to accept; false or a message to reject.' },
            { name: 'onTagRejected', type: '(tag, reason, message?) => void', description: "reason is 'duplicate', 'max' or 'invalid'." },
            { name: 'suggestions', type: 'string[]', description: 'Shows a floating suggestion list.' },
            { name: 'delimiters', type: 'string[]', default: "[',']", description: 'Characters that end a tag when typed.' },
            { name: 'allowDuplicates / caseSensitive', type: 'boolean', default: 'false', description: 'Duplicate handling. "React" and "react" match by default.' },
            { name: 'addOnBlur', type: 'boolean', default: 'true', description: 'Turn leftover text into a tag on blur.' },
            { name: 'name / separator', type: 'string', default: "'' / ','", description: 'Hidden input that submits the tags joined by separator.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Minimum height 32 / 36 / 44px.' },
            { name: 'removeLabel', type: '(tag: string) => string', description: 'Accessible name of a chip × button. Default "Remove {tag}".' },
            { name: 'groupClassName', type: 'string', description: 'Class for the box; className goes on the text input.' },
            { name: '...props', type: 'InputHTMLAttributes', description: 'Forwarded to the text input (placeholder, disabled, readOnly, inputMode, aria-*), including ref.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Tab / comma', 'Adds the typed text (or the highlighted suggestion).'],
            ['Backspace', 'On empty text: highlights the last chip, then removes it.'],
            ['Down / Up', 'Opens the suggestions and moves the highlight.'],
            ['Escape', 'Closes the suggestions.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A native text input inside the box; clicking anywhere in the box focuses it.',
            'Each chip × has a name that says what it removes. Added, removed and refused tags are announced in a polite live region.',
            'With suggestions the input is a combobox: aria-expanded, aria-controls, aria-activedescendant and a listbox of options.',
            'Inside a Field the id, aria-describedby, aria-invalid, required and disabled state are wired automatically.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'A new chip pops in (rise, scale .96, light blur); the suggestion list uses the same entrance and a faster exit.',
            'A refused duplicate shakes the existing chip for 360ms. Reduced motion keeps the live-region message and drops the shake.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
