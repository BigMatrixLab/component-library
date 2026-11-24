import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CalendarSingle from '@/examples/calendar/single';
import CalendarRange from '@/examples/calendar/range';
import CalendarMultiple from '@/examples/calendar/multiple';
import CalendarTwoMonths from '@/examples/calendar/two-months';
import CalendarDisabled from '@/examples/calendar/disabled';
import CalendarLocale from '@/examples/calendar/locale';

export const metadata: Metadata = { title: 'Calendar' };

export default function CalendarPage() {
  return (
    <DocPage href="/docs/components/calendar">
      <Section id="single" title="Single date">
        <P>A month grid for picking one day. Today carries a quiet outline; the selected day is filled. Use the arrows or the keyboard to change month.</P>
        <Example component="calendar" file="calendar/single" title="Single date">
          <CalendarSingle />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Choosing dates where seeing the surrounding days matters: bookings, availability, scheduling.',
            'Inside a popover as a date picker (the date helpers are exported for that).',
            'Not for far-away dates like a birth date (a typed field is faster), or for times.',
          ]}
        />
      </Section>

      <Section id="range" title="Date range">
        <P>
          <Code>mode=&quot;range&quot;</Code>: the first click sets the start, the second completes the range in either direction, a third starts over. While the end is open, hovering or moving keyboard focus previews the range.
        </P>
        <Example component="calendar" file="calendar/range" title="Date range">
          <CalendarRange />
        </Example>
      </Section>

      <Section id="multiple" title="Multiple dates">
        <Example component="calendar" file="calendar/multiple" title="Multiple dates">
          <CalendarMultiple />
        </Example>
      </Section>

      <Section id="months" title="Two months">
        <P><Code>numberOfMonths</Code> places months side by side; they wrap under each other on narrow screens. Here the past is disabled with <Code>min</Code>.</P>
        <Example component="calendar" file="calendar/two-months" title="Two months">
          <CalendarTwoMonths />
        </Example>
      </Section>

      <Section id="disabled" title="Min, max and disabled dates">
        <P><Code>min</Code> and <Code>max</Code> bound the range; <Code>disabled</Code> takes a list of dates or a function. Disabled days stay focusable for the keyboard but can’t be selected.</P>
        <Example component="calendar" file="calendar/disabled" title="Min, max and disabled dates">
          <CalendarDisabled />
        </Example>
      </Section>

      <Section id="locale" title="Locale and week start">
        <P>Month and weekday names come from <Code>Intl</Code>. <Code>weekStartsOn</Code> is 0 (Sunday) to 6; the default is 1 (Monday).</P>
        <Example component="calendar" file="calendar/locale" title="Locale and week start">
          <CalendarLocale />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Calendar"
          rows={[
            { name: 'mode', type: "'single' | 'multiple' | 'range'", default: "'single'", description: 'Selection model. Decides the type of value.' },
            { name: 'value / defaultValue', type: 'Date | null · Date[] · { from, to }', description: 'Plain Date objects. Range uses { from: Date | null; to: Date | null }.' },
            { name: 'onValueChange', type: '(value) => void', description: 'Called on every selection change.' },
            { name: 'month / defaultMonth', type: 'Date', description: 'Visible month, controlled or initial. Default: the selected date, else today.' },
            { name: 'onMonthChange', type: '(month: Date) => void', description: 'Called with the first visible month.' },
            { name: 'numberOfMonths', type: 'number', default: '1', description: 'Months side by side.' },
            { name: 'weekStartsOn', type: '0 | 1 | 2 | 3 | 4 | 5 | 6', default: '1', description: 'First weekday column (0 = Sunday).' },
            { name: 'locale', type: 'string', default: "'en-US'", description: 'BCP 47 tag for month and weekday names.' },
            { name: 'min / max', type: 'Date', description: 'Earliest and latest selectable date; the month buttons stop there.' },
            { name: 'disabled', type: 'Date[] | (date: Date) => boolean', description: 'Days that cannot be selected.' },
            { name: 'showOutsideDays', type: 'boolean', default: 'true', description: 'Muted days of neighbouring months (single month only). Clicking one turns to that month.' },
            { name: 'previousLabel / nextLabel', type: 'string', description: 'Accessible names of the month buttons.' },
            { name: 'today', type: 'Date', description: 'Override “today” (tests, demos).' },
          ]}
        />
        <P>
          Date helpers are exported for building pickers: <Code>startOfDay</Code>, <Code>addDays</Code>, <Code>addMonths</Code>, <Code>addYears</Code>, <Code>startOfMonth</Code>, <Code>endOfMonth</Code>, <Code>startOfWeek</Code>, <Code>isSameDay</Code>, <Code>isBetween</Code>, <Code>clampDate</Code>, <Code>getMonthWeeks</Code>, <Code>dateKey</Code> and more. They build dates from year/month/day parts at local midnight, so DST and time zones never shift a day.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Arrow keys', 'Move focus by a day (left/right) or a week (up/down). Crossing a month edge turns the page.'],
            ['Home / End', 'First / last day of the week.'],
            ['Page Up / Page Down', 'Previous / next month (same day, clamped).'],
            ['Shift + Page Up / Down', 'Previous / next year.'],
            ['Enter / Space', 'Select the focused day.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA date grid pattern: a role="grid" table with weekday column headers and one tab stop (roving tabindex).',
            'Each day is a button named with its full date (“Tuesday, November 24, 2026”); today has aria-current="date"; selected cells have aria-selected.',
            'The month title is a polite live region, so changing month is announced.',
            'Selection and today are never colour only: today is outlined, selection is filled.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Changing month slides the grid 10px and fades it in over 220ms; the direction follows the arrow used.',
            'Day presses scale to .94 on the snappy spring.',
            'Reduced motion: the month still changes, without the slide.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
