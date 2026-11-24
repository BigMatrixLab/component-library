import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import PasswordStrengthSignUp from '@/examples/password-strength/sign-up';
import PasswordStrengthCompact from '@/examples/password-strength/compact';
import PasswordStrengthCustomRules from '@/examples/password-strength/custom-rules';

export const metadata: Metadata = { title: 'Password strength' };

export default function PasswordStrengthPage() {
  return (
    <DocPage href="/docs/components/password-strength">
      <Section id="sign-up" title="Sign-up password">
        <P>
          A four-segment meter and a checklist under the input. Segments fill in order as the password gets stronger, and each requirement ticks off with a small pop as it is met.
        </P>
        <Example component="password-strength" file="password-strength/sign-up" title="Sign-up password">
          <PasswordStrengthSignUp />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Creating or changing a password, where feedback while typing prevents a rejected submit.',
            'Passphrases with house rules (minimum length, words to avoid) — pass your own requirements.',
          ]}
        />
        <P>
          Not for: sign-in forms (never rate a password someone already has), or as the only check — the score is guidance for people, the server still validates.
        </P>
      </Section>

      <Section id="compact" title="Meter only">
        <P>
          <Code>showChecklist={'{false}'}</Code> keeps just the meter and its word. <Code>scorePassword</Code> is exported, so the form can use the same score to enable its submit button.
        </P>
        <Example component="password-strength" file="password-strength/compact" title="Meter only">
          <PasswordStrengthCompact />
        </Example>
      </Section>

      <Section id="custom" title="Custom requirements">
        <P>
          Each requirement is <Code>{'{ id, label, test }'}</Code>. A password can only rate <em>strong</em> when every requirement is met. Define the list outside the component so it keeps its identity between renders.
        </P>
        <Example component="password-strength" file="password-strength/custom-rules" title="Custom requirements">
          <PasswordStrengthCustomRules />
        </Example>
      </Section>

      <Section id="scoring" title="Scoring">
        <List
          items={[
            'Length: 8–11 characters 1 point, 12–15 two, 16 or more three.',
            'Variety: one point for each kind of character beyond the first (lower case, upper case, numbers, symbols).',
            'A straight run such as “1234” or “abcd” costs a point.',
            'Points map to 1 weak (0–1), 2 fair (2–3), 3 good (4) and 4 strong (5+).',
            'Common passwords and a single repeated character are always weak.',
          ]}
        />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="PasswordStrength"
          rows={[
            { name: 'value', type: 'string', description: 'The password being typed.' },
            { name: 'requirements', type: 'PasswordRequirement[]', default: 'defaultPasswordRequirements', description: '{ id, label, test(password) }. Default: 8+ characters, upper and lower case, a number, a symbol.' },
            { name: 'labels', type: '{ weak?, fair?, good?, strong? }', default: 'Weak / Fair / Good / Strong', description: 'The word beside the meter.' },
            { name: 'showChecklist', type: 'boolean', default: 'true', description: 'Show the requirement checklist.' },
            { name: 'showLabel', type: 'boolean', default: 'true', description: 'Show the level word (also the live region).' },
            { name: 'meterLabel', type: 'string', default: "'Password strength'", description: 'Accessible name of the meter.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the root, including id (for aria-describedby), ref and className.' },
          ]}
        />
        <PropsTable
          title="scorePassword(password, requirements?) → PasswordStrengthResult"
          rows={[
            { name: 'score', type: '0 | 1 | 2 | 3 | 4', description: 'Empty, weak, fair, good, strong.' },
            { name: 'level', type: "'empty' | 'weak' | 'fair' | 'good' | 'strong'", description: 'Also on the root as data-level.' },
            { name: 'requirements', type: '{ id, label, met }[]', description: 'The checklist state.' },
            { name: 'metCount', type: 'number', description: 'How many requirements are met.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Tab', 'The meter and checklist are not focusable; focus stays in the password input.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>Give the root an <Code>id</Code> and point the input’s <Code>aria-describedby</Code> at it, so the strength and checklist are read with the field.</>,
            'The meter is role="meter" (0–4) with the level word as its value text.',
            'The level word is a polite, atomic live region: it speaks only when the level changes, not on every keystroke.',
            'Each requirement carries hidden “Met:” or “Not met:” text; the check marks are decorative.',
            'Colour is never the only signal: the word and the number of filled segments say the same thing.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Segments grow from the start edge on the smooth spring, 35ms apart, counted from the previous score so only the segments that change wait.',
            'A met requirement’s mark fills with the success colour and its check scales in on the snappy spring.',
            'Colour shifts between levels over 220ms.',
            'Reduced motion: segments and marks change state instantly, with no stagger.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
