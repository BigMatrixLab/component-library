import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import DatePickerDueDate from '@/examples/date-picker/due-date';
import DatePickerTypeable from '@/examples/date-picker/typeable';
import DatePickerBookingRange from '@/examples/date-picker/booking-range';
import DatePickerReportPeriod from '@/examples/date-picker/report-period';
import DatePickerInForm from '@/examples/date-picker/in-form';

export const metadata: Metadata = { title: 'Date picker' };

export default function DatePickerPage() {
  return (
    <DocPage href="/docs/components/date-picker">
      <Section id="usage" title="Usage">
        <P>
          A field that looks like an input and opens the <Code>Calendar</Code> in a popover. Picking a day closes it. Inside a <Code>Field</Code> the label, hint and error wire themselves up. Here weekends and past days are blocked.
        </P>
        <Example component="date-picker" file="date-picker/due-date" title="Due date" minHeight={160}>
          <DatePickerDueDate />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A single date in a form: due date, birthday, delivery day.',
            <>A start and end that belong together: a stay, a report period, a campaign — use <Code>DateRangePicker</Code>.</>,
            <>Dates people know by heart or paste from elsewhere — add <Code>typeable</Code>.</>,
          ]}
        />
        <P>Not for: browsing a month with no field around it (use Calendar), or a date years away that is quicker to type (a birth year, say) — use typeable or a text input.</P>
      </Section>

      <Section id="typeable" title="Typeable">
        <P>
          With <Code>typeable</Code> the text can be edited. It is parsed on Enter and on blur: ISO dates, numbers in the locale’s day/month order, and month names all work. Something that is not a real date, or is outside <Code>min</Code> and <Code>max</Code>, marks the field invalid and keeps what was typed. ArrowDown opens the calendar.
        </P>
        <Example component="date-picker" file="date-picker/typeable" title="Typeable date" minHeight={160}>
          <DatePickerTypeable />
        </Example>
      </Section>

      <Section id="range" title="Date range with presets">
        <P>
          <Code>DateRangePicker</Code> shows two months side by side (one on phones) and a column of presets. The range commits when the second date is picked. Replace the presets with your own — each one is a label and a function of today — or pass <Code>presets={'{false}'}</Code> to hide them.
        </P>
        <Example component="date-picker" file="date-picker/booking-range" title="Booking range" minHeight={160}>
          <DatePickerBookingRange />
        </Example>
      </Section>

      <Section id="confirm" title="Apply and cancel">
        <P>
          Add <Code>confirm</Code> for filters that reload data: the picker keeps a draft and only commits on Apply. Cancel, Esc and a click outside discard it. This one uses the default presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month and This year.
        </P>
        <Example component="date-picker" file="date-picker/report-period" title="Report period" minHeight={160}>
          <DatePickerReportPeriod />
        </Example>
      </Section>

      <Section id="forms" title="In a form">
        <P>
          Give the picker a <Code>name</Code> (or <Code>startName</Code> and <Code>endName</Code> for a range) and it submits ISO dates, <Code>yyyy-mm-dd</Code>, through hidden inputs — never a locale string.
        </P>
        <Example component="date-picker" file="date-picker/in-form" title="Submitting dates" minHeight={160}>
          <DatePickerInForm />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="DatePicker"
          rows={[
            { name: 'value / defaultValue', type: 'Date | null', description: 'Selected day. Controlled or uncontrolled.' },
            { name: 'onValueChange', type: '(value: Date | null) => void', description: 'Called on pick, clear and typed commits.' },
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Control the popover.' },
            { name: 'locale', type: 'string', default: "'en-US'", description: 'BCP 47 tag for the text, the calendar and typed input.' },
            { name: 'format', type: 'Intl.DateTimeFormatOptions', default: '{ month: "short", day: "numeric", year: "numeric" }', description: 'How the value is shown.' },
            { name: 'placeholder', type: 'string', default: "'Pick a date'", description: 'Shown while empty.' },
            { name: 'clearable', type: 'boolean', default: 'true', description: 'Clear button once there is a value.' },
            { name: 'typeable', type: 'boolean', default: 'false', description: 'Edit the date as text.' },
            { name: 'min / max', type: 'Date', description: 'Earliest and latest selectable day.' },
            { name: 'disabledDates', type: 'Date[] | (date: Date) => boolean', description: 'Days that cannot be picked or typed.' },
            { name: 'disabled / required', type: 'boolean', description: 'Also follow the surrounding Field.' },
            { name: 'name', type: 'string', description: 'Hidden input name; submits yyyy-mm-dd.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 32 / 36 / 44px.' },
            { name: 'calendarProps', type: 'Pick<CalendarProps, …>', description: 'weekStartsOn, previousLabel, nextLabel, showOutsideDays.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the field; ref goes to it too.' },
          ]}
        />
        <PropsTable
          title="DateRangePicker"
          rows={[
            { name: 'value / defaultValue', type: '{ from: Date | null; to: Date | null }', description: 'Selected range.' },
            { name: 'onValueChange', type: '(range: DateRange) => void', description: 'Called when a range is committed or cleared.' },
            { name: 'presets', type: 'DateRangePreset[] | false', default: 'Today … This year', description: 'Shortcuts. Each is { label, range(today) }.' },
            { name: 'confirm', type: 'boolean', default: 'false', description: 'Apply / Cancel footer; nothing commits before Apply.' },
            { name: 'startName / endName', type: 'string', description: 'Hidden input names; submit yyyy-mm-dd.' },
            { name: 'placeholder', type: 'string', default: "'Pick a date range'", description: 'Shown while empty.' },
            { name: '...', type: 'locale, format, min, max, disabledDates, disabled, required, size, today, clearable', description: 'As DatePicker.' },
          ]}
        />
        <P>
          Helpers: <Code>formatPickerDate</Code>, <Code>formatPickerDateRange</Code>, <Code>parsePickerDate</Code> and <Code>defaultDateRangePresets</Code> are exported for your own text and presets.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'On the field: open the calendar. In typeable mode, Enter commits the text.'],
            ['Arrow Down', 'Open the calendar from the field.'],
            ['Arrows, Home, End, Page Up / Down', 'Move around the calendar (see Calendar).'],
            ['Enter / Space', 'On a day: pick it.'],
            ['Esc', 'Close without changing; focus returns to the field.'],
            ['Tab', 'Moves through the panel; tabbing out closes it.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The trigger is a button with aria-haspopup="dialog" and aria-expanded; its value is announced as its description.',
            'The panel is a non-modal dialog with a label; the calendar follows the APG date-grid pattern.',
            'Typed text uses aria-invalid. Clear and calendar buttons have accessible names.',
            'Keyboard focus shows a 3px ring on the whole field.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The panel rises in 4px from the field with a soft blur and leaves faster.',
            'The field itself never scales: it opens a popup, so it answers with border and ring.',
            'Reduced motion: the panel only fades.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
