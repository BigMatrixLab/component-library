import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';

export const metadata: Metadata = { title: 'Colour & tokens' };

const groups: { title: string; tokens: [string, string][] }[] = [
  {
    title: 'Surfaces',
    tokens: [
      ['background', 'Page'],
      ['surface', 'Cards (bg-card)'],
      ['surface-raised', 'Menus, popovers, dialogs (bg-popover)'],
      ['surface-muted', 'Wells, table headers (bg-muted)'],
      ['foreground', 'Body text'],
      ['muted-foreground', 'Secondary text'],
    ],
  },
  {
    title: 'Interactive',
    tokens: [
      ['primary', 'Primary fill — follows the accent'],
      ['primary-text', 'Links and accent text'],
      ['secondary', 'Secondary fill'],
      ['accent', 'Hover / highlighted item'],
      ['ring', 'Focus ring'],
      ['control-on', 'Checked switch, checkbox, slider'],
    ],
  },
  {
    title: 'Lines',
    tokens: [
      ['border', 'Default 1px line'],
      ['border-subtle', 'Lines inside a surface'],
      ['border-strong', 'Inputs (border-input)'],
    ],
  },
  {
    title: 'Status',
    tokens: [
      ['destructive', 'Fill for destructive actions'],
      ['destructive-text', 'Error text on surfaces'],
      ['success', 'Fill'],
      ['success-text', 'Text on surfaces'],
      ['warning', 'Fill (dark text on top)'],
      ['warning-text', 'Text on surfaces'],
      ['info', 'Fill'],
      ['info-text', 'Text on surfaces'],
    ],
  },
  {
    title: 'Data series',
    tokens: [
      ['series-1', 'Chart series 1'],
      ['series-2', 'Chart series 2'],
      ['series-3', 'Chart series 3'],
      ['series-4', 'Chart series 4'],
      ['series-5', 'Chart series 5'],
      ['series-6', 'Chart series 6'],
    ],
  },
];

export default function ColorsPage() {
  return (
    <DocPage href="/docs/foundations/colors" wide>
      <Section id="layers" title="Two layers">
        <List
          items={[
            <>
              <strong className="font-medium text-foreground">Palette</strong> — raw OKLCH colours (<Code>--ui-gray-50…1000</Code>, <Code>--ui-violet-600</Code>…). Never used by components directly.
            </>,
            <>
              <strong className="font-medium text-foreground">Semantic roles</strong> — what a colour is for (<Code>--ui-surface</Code>, <Code>--ui-muted-foreground</Code>, <Code>--ui-destructive-text</Code>). Components only read these, so a theme only remaps roles.
            </>,
            <>
              Fills and text are separate where one colour can’t do both: a red that carries white text (≥ 4.5:1) is too dark to read as text on a dark page, so dark mode uses <Code>-text</Code> tokens for text.
            </>,
          ]}
        />
        <P>Every role is also a Tailwind colour: <Code>bg-card</Code>, <Code>text-muted-foreground</Code>, <Code>border-input</Code>, <Code>text-destructive-text</Code>, <Code>bg-series-1</Code>. Switch the theme and accent in the top bar — this page updates live.</P>
      </Section>

      {groups.map((g) => (
        <Section key={g.title} id={g.title.toLowerCase().replace(/\s+/g, '-')} title={g.title}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.tokens.map(([name, use]) => (
              <div key={name} className="overflow-hidden rounded-lg border border-border">
                <div className="h-14 border-b border-border" style={{ background: `var(--ui-${name})` }} />
                <div className="px-3 py-2">
                  <p className="font-mono text-xs">--ui-{name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <Section id="accents" title="Accents and dark mode">
        <P>
          Dark mode is the <Code>dark</Code> class on <Code>&lt;html&gt;</Code>. Accents are <Code>data-accent</Code> on <Code>&lt;html&gt;</Code> or any subtree: <Code>violet</Code>, <Code>blue</Code>, <Code>emerald</Code>, <Code>rose</Code>, <Code>amber</Code>, <Code>orange</Code>. Every accent fill and text colour was measured at ≥ 4.5:1 in both modes.
        </P>
        <CodeBlock
          lang="tsx"
          code={`// app/layout.tsx
import { ThemeScript } from 'ui-kit';

<html lang="en" suppressHydrationWarning>
  <head><ThemeScript /></head>   {/* applies the saved theme before paint */}
  <body>{children}</body>
</html>

// any client component
const { mode, resolvedMode, accent, setMode, setAccent, toggle } = useTheme();`}
        />
      </Section>

      <Section id="custom" title="Your own colours">
        <CodeBlock
          lang="css"
          code={`/* after ui-kit's CSS */
:root {
  --ui-primary: oklch(0.55 0.2 250);
  --ui-primary-text: oklch(0.55 0.2 250);
  --ui-radius: 0.75rem;
}
.dark {
  --ui-primary-text: oklch(0.72 0.15 250);
}`}
        />
      </Section>
    </DocPage>
  );
}
