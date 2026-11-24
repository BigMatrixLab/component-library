import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import TimePickerMeetingTime from '@/examples/time-picker/meeting-time';
import TimePickerOpeningHours from '@/examples/time-picker/opening-hours';
import TimePickerTwentyFourHour from '@/examples/time-picker/twenty-four-hour';

export const metadata: Metadata = { title: 'Time picker' };

export default function TimePickerPage() {
  return (
    <DocPage href="/docs/components/time-picker">
      <Section id="usage" title="Usage">
        <P>
          Hour, minute and AM/PM are separate segments, like a native time input. Type digits (they move on by themselves), step with the arrow keys, clear with Backspace. Add <Code>step</Code> for a list of times to pick from; the current time is scrolled into view.
        </P>
        <Example component="time-picker" file="time-picker/meeting-time" title="Meeting time" minHeight={160}>
          <TimePickerMeetingTime />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A time of day in a form: a meeting, a pickup, opening hours.',
            <>Slots on a regular grid — add <Code>step</Code> and bound them with <Code>min</Code> and <Code>max</Code>.</>,
            'Exact times such as 09:47 — the segments take any minute, with or without the list.',
          ]}
        />
        <P>Not for: a duration (use a number input), a date and time together (pair a DatePicker with a TimePicker), or a free-form schedule (use your own scheduler).</P>
      </Section>

      <Section id="hours" title="Opening hours">
        <P>
          Two pickers per row, each bounded by <Code>min</Code> and <Code>max</Code>. A value outside the bounds, or a closing time before opening, marks the field invalid.
        </P>
        <Example component="time-picker" file="time-picker/opening-hours" title="Opening hours" minHeight={260}>
          <TimePickerOpeningHours />
        </Example>
      </Section>

      <Section id="clock" title="12 or 24 hours, seconds">
        <P>
          The locale decides the clock: <Code>en-US</Code> is 12-hour with AM/PM, <Code>de-DE</Code> is 24-hour. Force one with <Code>hour12</Code>. <Code>seconds</Code> adds a third segment. The value is always a 24-hour string — <Code>HH:mm</Code> or <Code>HH:mm:ss</Code> — and <Code>null</Code> until every segment is filled.
        </P>
        <Example component="time-picker" file="time-picker/twenty-four-hour" title="24-hour and seconds" minHeight={200}>
          <TimePickerTwentyFourHour />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="TimePicker"
          rows={[
            { name: 'value / defaultValue', type: 'string | null', description: '"HH:mm" ("HH:mm:ss" with seconds). Controlled or uncontrolled.' },
            { name: 'onValueChange', type: '(value: string | null) => void', description: 'Called as soon as every segment is filled, and with null when one is cleared.' },
            { name: 'locale', type: 'string', default: "'en-US'", description: 'Decides 12 or 24 hours and the AM/PM words.' },
            { name: 'hour12', type: 'boolean', description: 'Force a 12-hour or 24-hour clock.' },
            { name: 'seconds', type: 'boolean', default: 'false', description: 'Show a seconds segment.' },
            { name: 'step', type: 'number', description: 'Minutes between times in the popover list. Without it there is no list.' },
            { name: 'min / max', type: 'string', description: '"HH:mm" bounds for the list; a value outside them is flagged invalid.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Control the list popover.' },
            { name: 'clearable', type: 'boolean', default: 'true', description: 'Clear button while anything is filled in.' },
            { name: 'disabled / required', type: 'boolean', description: 'Also follow the surrounding Field.' },
            { name: 'name', type: 'string', description: 'Hidden input name; submits HH:mm.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 32 / 36 / 44px.' },
            { name: 'labels', type: 'TimePickerLabels', description: 'Accessible names: hour, minute, second, period, clear, open, list.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the field (role="group"); give it an aria-label.' },
          ]}
        />
        <P>
          Helpers: <Code>parseTimeValue</Code>, <Code>formatTimeValue</Code>, <Code>formatTimeLabel</Code>, <Code>buildTimeOptions</Code> and <Code>resolveHour12</Code> are exported.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['0–9', 'Fill the segment; moves on once the number is complete.'],
            ['Arrow Up / Down', 'Step the segment, wrapping around. On AM/PM: toggle.'],
            ['Arrow Left / Right', 'Previous / next segment.'],
            ['Home / End', 'Lowest / highest value of the segment.'],
            ['A / P', 'On AM/PM: choose AM or PM.'],
            ['Backspace / Delete', 'Clear the segment; Backspace on an empty one goes back.'],
            [': . , Space', 'Next segment.'],
            ['Alt + Arrow Down', 'Open the list of times.'],
            ['List: Arrows, Home, End', 'Move through the times; Enter or Space picks, Esc closes.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The field is a group; every segment is a spinbutton with a name, min, max, now and text value.',
            'The list is a listbox of options with aria-selected; its button reports aria-expanded.',
            'Soft keyboards work: the typed character is read from the input event when no key code arrives.',
            'Keyboard focus shows a 3px ring on the whole field and fills the active segment.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The list rises in like every popover and leaves faster; the highlight on a segment fades in 150ms.',
            'No press scale on the list button, because it opens a popup.',
            'Reduced motion: the list only fades.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
