import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ThemeSwitchHeader from '@/examples/theme-switch/header';
import ThemeSwitchOptions from '@/examples/theme-switch/options';

export const metadata: Metadata = { title: 'Theme switch' };

export default function ThemeSwitchPage() {
  return (
    <DocPage href="/docs/components/theme-switch">
      <Section id="header" title="In a header">
        <P>Three icons — light, dark, system — with one pill that glides between them. In browsers with View Transitions, the new theme is revealed as a circle growing from the option you clicked.</P>
        <Example component="theme-switch" file="theme-switch/header" title="In a header">
          <ThemeSwitchHeader />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'App and docs headers where the user should choose between light, dark and following the system.',
            <>If you only need a two-state toggle, call <Code>useTheme().toggle()</Code> from your own button.</>,
          ]}
        />
      </Section>

      <Section id="options" title="Sizes and instant swap">
        <P><Code>size=&quot;sm&quot;</Code> makes the options 24px; <Code>reveal=&#123;false&#125;</Code> swaps instantly with no transition.</P>
        <Example component="theme-switch" file="theme-switch/options" title="Sizes and instant swap">
          <ThemeSwitchOptions />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ThemeSwitch"
          rows={[
            { name: 'reveal', type: 'boolean', default: 'true', description: 'Circular reveal from the clicked option via the View Transitions API. Falls back to an instant swap.' },
            { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Options are 24 / 28px (36px on touch screens).' },
            { name: 'label', type: 'string', default: "'Theme'", description: 'Accessible name of the group.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the group, including ref and className.' },
          ]}
        />
        <P>It reads and writes the same state as <Code>useTheme()</Code> (stored in localStorage and applied by the theme script), so it stays in sync with any other control.</P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves into and out of the group (one stop: the selected option).'],
            ['← → ↑ ↓', 'Selects the previous / next option.'],
            ['Home / End', 'Selects the first / last option.'],
            ['Space / Enter', 'Selects the focused option.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A radio group: role="radiogroup" with three role="radio" options, aria-checked and a roving tabindex. Selection follows focus.',
            'Each icon-only option has an accessible name (Light, Dark, System) and a tooltip title.',
            'The pill is decorative (aria-hidden). Keyboard focus shows the 3px ring.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            <>Pill: one element measured by <Code>useIndicator</Code> and moved with <Code>transform</Code> on <Code>--ui-spring-morph</Code> (550ms). The first placement is never animated.</>,
            'Reveal: document.startViewTransition() swaps the theme; the new snapshot is clipped by circle(0 → farthest corner) centred on the click point, 520ms, cubic-bezier(0.22, 1, 0.36, 1). While it runs, <html data-ui-reveal> turns off the browser’s default cross-fade.',
            'Keyboard activation reveals from the centre of the focused option.',
            'Reduced motion: no transition at all — the theme swaps instantly and the pill jumps. Browsers without View Transitions behave the same.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
