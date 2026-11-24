import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SliderVolume from '@/examples/slider/volume';
import SliderPriceRange from '@/examples/slider/price-range';
import SliderQuality from '@/examples/slider/quality';
import SliderVertical from '@/examples/slider/vertical';

export const metadata: Metadata = { title: 'Slider' };

export default function SliderPage() {
  return (
    <DocPage href="/docs/components/slider">
      <Section id="single" title="Single value">
        <P>
          Drag the thumb, click the track, or use the keyboard. Values are always an array: <Code>[40]</Code> is one thumb. A value bubble shows while dragging or when the thumb is focused with the keyboard.
        </P>
        <Example component="slider" file="slider/volume" title="Volume" align="stretch">
          <SliderVolume />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Choosing a value on a continuous or finely stepped scale where the rough position matters: volume, brightness, a price filter.',
            'Choosing a range between two values, with two thumbs that cannot cross.',
          ]}
        />
        <P>Not for: an exact number the user must type (use a number input), or a handful of named options (use a radio group).</P>
      </Section>

      <Section id="range" title="Range">
        <P>
          Pass two values for a range. Each thumb has its own name (<Code>thumbLabels</Code>), and <Code>minStepsBetweenThumbs</Code> keeps them apart.
        </P>
        <Example component="slider" file="slider/price-range" title="Price range" align="stretch">
          <SliderPriceRange />
        </Example>
      </Section>

      <Section id="steps" title="Steps and value text">
        <P>
          <Code>step</Code> snaps the value. <Code>formatValue</Code> changes the bubble and the <Code>aria-valuetext</Code> that screen readers announce, so a level reads “High” rather than “2”.
        </P>
        <Example component="slider" file="slider/quality" title="Export quality" align="stretch">
          <SliderQuality />
        </Example>
      </Section>

      <Section id="vertical" title="Vertical">
        <P>
          <Code>orientation=&quot;vertical&quot;</Code> is 12rem tall by default (override with <Code>className</Code>). The minimum sits at the bottom, and Up increases the value.
        </P>
        <Example component="slider" file="slider/vertical" title="Equaliser" align="start">
          <SliderVertical />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Slider"
          rows={[
            { name: 'value', type: 'number[]', description: 'Controlled thumb values. One entry is a single slider; two is a range.' },
            { name: 'defaultValue', type: 'number[]', default: '[min]', description: 'Initial values when uncontrolled.' },
            { name: 'onValueChange', type: '(value: number[]) => void', description: 'Called on every change while dragging or using the keyboard.' },
            { name: 'onValueCommit', type: '(value: number[]) => void', description: 'Called when a drag ends or a key changes the value. Use it to save.' },
            { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: 'Range and snapping.' },
            { name: 'minStepsBetweenThumbs', type: 'number', default: '0', description: 'Minimum gap between range thumbs, in steps.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical needs a height (12rem by default).' },
            { name: 'formatValue', type: '(value: number) => string', description: 'Text for the bubble and aria-valuetext.' },
            { name: 'thumbLabels', type: 'string[]', default: "['Minimum', 'Maximum']", description: 'Accessible names for range thumbs.' },
            { name: 'tooltip', type: "'auto' | 'always' | 'never'", default: "'auto'", description: 'Auto: while dragging, hovered or keyboard-focused.' },
            { name: 'name', type: 'string', description: 'Form field; one hidden input per thumb.' },
            { name: 'disabled', type: 'boolean', description: 'Dims the slider and ignores input.' },
            { name: 'aria-label / aria-labelledby', type: 'string', description: 'Names the slider (a group for ranges).' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the root, including ref and className.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['→ / ↑', 'Increases the focused thumb by one step.'],
            ['← / ↓', 'Decreases the focused thumb by one step.'],
            ['Page Up / Page Down', 'Changes the value by about a tenth of the range.'],
            ['Home / End', 'Jumps to the minimum / maximum (or the neighbouring thumb in a range).'],
            ['Tab', 'Moves between thumbs; each thumb is a tab stop.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Each thumb is role="slider" with aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext and aria-orientation (WAI-ARIA slider and multi-thumb slider patterns).',
            'In a range, each thumb’s min and max are its neighbours’ values, and the pair sits in a role="group".',
            'Name the slider with aria-label or aria-labelledby; range thumbs get “Minimum” and “Maximum” by default.',
            'The value bubble is decorative; the value is announced through aria-valuetext.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Thumbs follow the pointer exactly, with no easing, so dragging never lags.',
            'The thumb grows to 1.12 on the snappy spring while held; the bubble rises 4px and sheds a 2px blur.',
            'Touch: vertical page scroll still works across a horizontal slider; a horizontal drag moves the thumb.',
            'Reduced motion: the bubble and thumb change state without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
