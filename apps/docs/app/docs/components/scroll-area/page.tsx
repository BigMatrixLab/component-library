import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ScrollAreaChangelog from '@/examples/scroll-area/changelog';
import ScrollAreaHorizontal from '@/examples/scroll-area/horizontal';

export const metadata: Metadata = { title: 'Scroll area' };

export default function ScrollAreaPage() {
  return (
    <DocPage href="/docs/components/scroll-area">
      <Section id="changelog" title="Changelog">
        <P>
          The browser still does the scrolling, so wheel, touch, trackpad, find-in-page and keyboard behave natively. The slim thumb is an overlay on top of it, and the edges fade only where there is more to read. Scroll the list and watch the top fade appear.
        </P>
        <Example component="scroll-area" file="scroll-area/changelog" title="Changelog" minHeight={380}>
          <ScrollAreaChangelog />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A panel with a fixed height whose content can grow: changelogs, logs, side lists, chat history.',
            'A row of cards or chips that may overflow sideways.',
          ]}
        />
        <P>Not for the page itself (let the page scroll) or for short content that always fits.</P>
      </Section>

      <Section id="horizontal" title="Horizontal">
        <P>
          Use <Code>orientation=&quot;horizontal&quot;</Code> (or <Code>both</Code>). The content wrapper sizes to its content, so a flex row with <Code>shrink-0</Code> items overflows instead of squashing.
        </P>
        <Example component="scroll-area" file="scroll-area/horizontal" title="Horizontal" align="stretch" minHeight={200}>
          <ScrollAreaHorizontal />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ScrollArea"
          rows={[
            { name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll.' },
            { name: 'label', type: 'string', default: "'Scrollable content'", description: 'Accessible name of the scrollable region.' },
            { name: 'fade', type: 'boolean', default: 'true', description: 'Fade edges that have more content beyond them.' },
            { name: 'scrollbar', type: "'hover' | 'always'", default: "'hover'", description: 'Thumbs show on hover, focus and while scrolling, or always.' },
            { name: 'viewportClassName', type: 'string', description: 'Class for the scrolling element (className styles the root, e.g. its height).' },
            { name: 'viewportRef', type: 'Ref<HTMLDivElement>', description: 'The scrolling element, for scrollTo and friends.' },
          ]}
        />
        <P>
          Size it from outside: <Code>h-80</Code> or <Code>max-h-80</Code> on the root. CSS knobs: <Code>--ui-scroll-fade-size</Code> (default 1.5rem).
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Focuses the scroll region (it has a visible focus ring).'],
            ['↑ ↓ ← →', 'Scroll by a line.'],
            ['Page Up / Page Down / Space', 'Scroll by a page.'],
            ['Home / End', 'Jump to the start / end.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The viewport is role="region" with tabindex="0" and an aria-label, so keyboard users can reach and scroll it (axe: scrollable-region-focusable).',
            'The custom thumbs are aria-hidden; the native scroll position is what assistive tech reads.',
            'Dragging the thumb or pressing the track is an extra for pointers, never the only way to scroll.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Thumbs fade in on hover and while scrolling; edge fades animate in over 220ms.',
            'Reduced motion: both appear without animation.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
