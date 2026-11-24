import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import DonutSources from '@/examples/chart/donut-sources';
import PiePlans from '@/examples/chart/pie-plans';

export const metadata: Metadata = { title: 'Donut & pie' };

export default function DonutChartPage() {
  return (
    <DocPage href="/docs/components/donut-chart">
      <Section id="usage" title="Usage">
        <P>
          <Code>DonutChart</Code> shows parts of a whole. The hole shows the total, or the value of the hovered slice. Slices have a small gap and rounded corners; hovering pushes one slice outward.
        </P>
        <Example component="chart" file="chart/donut-sources" title="Traffic sources" align="stretch">
          <DonutSources />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List items={['Five or fewer parts that add up to a meaningful total.', 'A quick read of the biggest share.']} />
        <P>Not for: comparing many close values (use bars) or showing change over time.</P>
      </Section>

      <Section id="pie" title="Pie">
        <P>
          Set <Code>innerRadius={'{0}'}</Code> for a pie. Pass <Code>colors</Code> to choose a colour per slice.
        </P>
        <Example component="chart" file="chart/pie-plans" title="Accounts by plan" align="stretch">
          <PiePlans />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="DonutChart"
          rows={[
            { name: 'data', type: 'Record<string, unknown>[]', description: 'One record per slice. Names must be unique.' },
            { name: 'index', type: 'string', description: 'Key of the slice name.' },
            { name: 'valueKey', type: 'string', description: 'Key of the slice value. Zero and negative values are skipped.' },
            { name: 'colors', type: 'SeriesColor[]', description: 'Colour per slice; defaults to series-1…6 in order.' },
            { name: 'innerRadius', type: 'number', default: '0.62', description: 'Hole size as a fraction of the radius. 0 is a pie.' },
            { name: 'padAngle', type: 'number', default: '2', description: 'Gap between slices, in degrees.' },
            { name: 'cornerRadius', type: 'number', default: '4', description: 'Rounded slice corners in px (shrinks on thin slices).' },
            { name: 'centerLabel / centerValue', type: 'ReactNode', description: 'Override the hole text. Defaults to the hovered slice, or "Total".' },
            { name: 'height', type: 'number', default: '240', description: 'Diameter limit in px.' },
            { name: 'valueFormat', type: 'ValueFormat', default: "'number'", description: 'Formats values in the hole and tooltip.' },
            { name: 'legend', type: "'top' | 'bottom' | false", default: "'bottom'", description: 'Clicking an item hides that slice.' },
            { name: 'tooltip / animate', type: 'boolean', default: 'true', description: 'Tooltip shows value and share; animate sweeps the ring on mount.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the chart.'],
            ['← / →', 'Moves to the previous or next slice.'],
            ['Home / End', 'First or last slice.'],
            ['Esc', 'Clears the selection.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'role="img" with a label listing every slice and value, plus a hidden table with the share of each.',
            'The active slice is announced through a polite live region.',
            'The legend names every slice, so colour is not the only cue.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The ring sweeps clockwise on mount (700ms, ease-out).',
            'A hovered slice moves 6px outward; the rest fade slightly.',
            'Reduced motion: drawn at full size straight away.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
