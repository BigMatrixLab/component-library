import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';
import { PackPicker } from '@/components/docs/theme-controls';
import { PackPreview } from './pack-preview';

export const metadata: Metadata = { title: 'Theme packs' };

const packs: { id: string; name: string; summary: string }[] = [
  { id: 'neutral', name: 'Neutral', summary: 'The default. Cool zinc greys, 10px corners, quiet shadows. Same as no attribute.' },
  { id: 'stone', name: 'Stone', summary: 'Warm greys and a paper-white page, 8px corners, warm-tinted shadows. Editorial, calm.' },
  { id: 'slate', name: 'Slate', summary: 'Cool blue-greys with a navy dark mode, crisper 6px corners and tight shadows. Dashboards.' },
  { id: 'soft', name: 'Soft', summary: 'Lavender-tinted page under white cards, a muted indigo primary, 14px corners, diffuse shadows.' },
  { id: 'mono', name: 'Mono', summary: 'Brutal-lite: pure greys, ink-black primary, strong borders instead of shadows, small corners, monospaced headings.' },
];

const knobs = [
  { name: '--ui-tone-0 … 950', type: 'colour ramp', default: 'gray palette', description: '14 steps: 0, 50, 100, 150, 200, 300, 400, 500, 700, 800, 850, 900, 925, 950. Most roles derive from it.' },
  { name: '--ui-pack-radius', type: 'length', default: '0.625rem', description: 'Becomes --ui-radius and every --radius-* step.' },
  { name: '--ui-pack-background', type: 'colour', default: 'tone-0 · tone-950', description: 'Page. Light value; add -dark for dark mode (same for every row below).' },
  { name: '--ui-pack-surface(-raised|-muted)', type: 'colour', default: 'tone-0 · 925 / 900 / 850', description: 'Cards, floating layers, wells.' },
  { name: '--ui-pack-foreground', type: 'colour', default: 'tone-950 · tone-50', description: 'Text on every surface.' },
  { name: '--ui-pack-muted-foreground', type: 'colour', default: 'tone-500 · tone-400', description: 'Secondary text. Keep ≥ 4.5:1 on surface-muted.' },
  { name: '--ui-pack-primary(-foreground|-text)', type: 'colour', default: 'tone-900 / 50 / 900', description: 'Brand fill, text on it, brand-coloured text. An accent replaces these.' },
  { name: '--ui-pack-secondary(-foreground)', type: 'colour', default: 'tone-100 / 900', description: 'Secondary fill and its text.' },
  { name: '--ui-pack-accent', type: 'colour', default: 'tone-100 · tone-800', description: 'Hover / highlighted item.' },
  { name: '--ui-pack-border(-subtle|-strong)', type: 'colour', default: 'tone-200 / 150 / 300', description: 'Lines; -strong is the input outline.' },
  { name: '--ui-pack-ring', type: 'colour', default: 'tone-400 · tone-500', description: 'Focus ring. An accent replaces it.' },
  { name: '--ui-pack-control-track', type: 'colour', default: 'tone-200 · tone-700', description: 'Off-state track of switches and sliders.' },
  { name: '--ui-pack-sidebar(-border|-accent)', type: 'colour', default: 'tone-50 / 200 / 150', description: 'App chrome.' },
  { name: '--ui-pack-shadow-xs|sm|md|lg', type: 'shadow', default: 'neutral shadows', description: 'Floating layers only. Use 0 0 0 0 transparent, not none, for no shadow.' },
  { name: '--ui-pack-overlay', type: 'colour', default: 'ink at 45% · black at 60%', description: 'Dialog and sheet backdrop.' },
];

export default function ThemesPage() {
  return (
    <DocPage href="/docs/foundations/themes" wide>
      <Section id="what" title="What a pack changes">
        <P>
          A theme pack changes the whole look in one attribute: the colour map in light <em>and</em> dark, corner radius, shadows and, for Mono, the display face. It only overrides semantic tokens (<Code>--ui-*</Code>), so every component follows without a line of component CSS changing.
        </P>
        <List
          items={[
            <>
              Put <Code>data-theme=&quot;stone&quot;</Code> on <Code>&lt;html&gt;</Code> for the whole app, or on any element to theme just that subtree.
            </>,
            <>
              Packs compose: dark mode (<Code>.dark</Code>) picks the pack’s dark map, and an accent (<Code>data-accent</Code>) replaces the pack’s primary colour, focus ring and checked controls.
            </>,
            <>
              <Code>neutral</Code> is the default look. Setting it on a subtree resets that subtree inside another pack.
            </>,
          ]}
        />
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Try it on this site</p>
          <PackPicker />
          <p className="text-sm text-muted-foreground">Saved in this browser and applied before paint on every page.</p>
        </div>
      </Section>

      <Section id="packs" title="All packs">
        <P>
          Each pack renders the same real components twice, in light and in dark, using <Code>data-theme</Code> on the preview. The site’s accent applies too: pick one in the top bar to see it combine with every pack.
        </P>
        <div className="grid gap-10">
          {packs.map((p) => (
            <div key={p.id}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                <Code>data-theme=&quot;{p.id}&quot;</Code>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{p.summary}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <PackPreview pack={p.id} mode="light" />
                <PackPreview pack={p.id} mode="dark" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock
          lang="tsx"
          code={`// app/layout.tsx — a fixed pack for the whole app
<html lang="en" data-theme="slate" suppressHydrationWarning>
  <head><ThemeScript /></head>   {/* applies saved mode, accent and pack before paint */}
  <body>{children}</body>
</html>

// a subtree
<section data-theme="soft">…</section>

// let people choose (saved under localStorage "ui-theme-pack")
import { THEME_PACKS, useTheme } from 'ui-kit';

const { pack, setPack } = useTheme();
<select value={pack} onChange={(e) => setPack(e.target.value)}>
  {THEME_PACKS.map((p) => <option key={p}>{p}</option>)}
</select>`}
        />
        <P>
          A pack the server rendered on <Code>&lt;html&gt;</Code> stays until the person picks another one with <Code>setPack</Code>; picking <Code>neutral</Code> removes it.
        </P>
      </Section>

      <Section id="composition" title="Dark mode, accents and nesting">
        <List
          items={[
            <>
              <strong className="font-medium text-foreground">Dark</strong> — <Code>.dark</Code> (or <Code>data-theme-mode=&quot;dark&quot;</Code>) on the same element or any ancestor switches the pack to its dark map. A <Code>.dark</Code> subtree inside a pack gets that pack’s dark map.
            </>,
            <>
              <strong className="font-medium text-foreground">Light inside dark</strong> — <Code>data-theme-mode=&quot;light&quot;</Code> on the <em>same</em> element as <Code>data-theme</Code> keeps a subtree light on a dark page (the previews above do this). It only works together with a pack; use <Code>data-theme=&quot;neutral&quot;</Code> for the default look.
            </>,
            <>
              <strong className="font-medium text-foreground">Accents</strong> — an accent on the same element or an ancestor always wins over the pack’s primary. Every accent was measured on every pack surface at ≥ 4.5:1.
            </>,
            <>
              <strong className="font-medium text-foreground">Nesting</strong> — the nearest <Code>data-theme</Code> wins. Mono’s monospaced headings do not leak into a nested pack.
            </>,
          ]}
        />
      </Section>

      <Section id="custom" title="Make your own pack">
        <P>
          A pack is a ramp of 14 tones plus the knobs you want to change. Everything else (light and dark maps, accent hand-off, focus ring, radius steps) comes from the engine, so a pack can’t get the precedence wrong. Load it after ui-kit’s CSS.
        </P>
        <CodeBlock
          lang="css"
          code={`[data-theme="forest"] {
  /* 1. Tone ramp, lightest → darkest (one hue, low chroma) */
  --ui-tone-0: oklch(1 0 0);
  --ui-tone-50: oklch(0.984 0.004 155);
  --ui-tone-100: oklch(0.965 0.007 155);
  --ui-tone-150: oklch(0.942 0.009 155);
  --ui-tone-200: oklch(0.918 0.011 155);
  --ui-tone-300: oklch(0.866 0.015 155);
  --ui-tone-400: oklch(0.703 0.025 155);
  --ui-tone-500: oklch(0.515 0.028 155);   /* muted text: ≥ 4.5:1 on tone-100 */
  --ui-tone-700: oklch(0.37 0.025 155);
  --ui-tone-800: oklch(0.275 0.02 155);
  --ui-tone-850: oklch(0.237 0.018 155);
  --ui-tone-900: oklch(0.212 0.016 155);
  --ui-tone-925: oklch(0.186 0.014 155);
  --ui-tone-950: oklch(0.145 0.012 155);

  /* 2. Only the knobs you want to change; -dark for dark mode */
  --ui-pack-radius: 0.5rem;
  --ui-pack-primary: oklch(0.45 0.1 155);
  --ui-pack-primary-foreground: oklch(1 0 0);
  --ui-pack-primary-text: oklch(0.45 0.1 155);
  --ui-pack-primary-dark: oklch(0.8 0.12 155);
  --ui-pack-primary-foreground-dark: var(--ui-tone-950);
  --ui-pack-primary-text-dark: oklch(0.8 0.12 155);
}`}
        />
        <P>
          Then use <Code>data-theme=&quot;forest&quot;</Code> or <Code>setPack(&apos;forest&apos;)</Code>. Measure every text pair (foreground and muted text on background, surface and surface-muted; primary-foreground on primary) at ≥ 4.5:1 in both modes before shipping.
        </P>
        <PropsTable title="Knobs" rows={knobs} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>Every built-in pack keeps body text, muted text, primary text and status text at ≥ 4.5:1 on its page, card and muted surfaces, in light and dark (lowest pair: 4.98:1, muted text on Soft’s hover fill).</>,
            <>Packs never change sizes, spacing or motion, so hit targets and reduced-motion behaviour are identical in every pack.</>,
            <>Mono replaces shadows with strong borders, so floating layers stay distinct from the page without relying on elevation.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
