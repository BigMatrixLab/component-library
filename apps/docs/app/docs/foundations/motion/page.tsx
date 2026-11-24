import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';
import { SpringDemo } from './spring-demo';

export const metadata: Metadata = { title: 'Motion' };

export default function MotionPage() {
  return (
    <DocPage href="/docs/foundations/motion">
      <Section id="signature" title="Soft rise">
        <P>
          Our signature: things arrive from 4–8px below, a touch smaller and slightly blurred, and settle in under 400ms with a fast ease-out. Exits are quicker than entrances. Motion explains where something came from; if it explains nothing, it goes.
        </P>
        <List
          items={[
            'Animate transform, opacity and filter only. Size changes animate only when the size is the information.',
            'One orchestrated entrance per view at most (ui-stagger); no scroll reveal on every section.',
            'Presses scale to .97; a button that opens a popup answers with colour, because the popup is positioned against it.',
            'Anything that reports state (switch thumb, progress, drawer edge) lands without overshoot.',
            'Reduced motion keeps the state change and removes the movement.',
          ]}
        />
      </Section>

      <Section id="springs" title="Spring presets">
        <P>
          Real damped-spring curves exported as CSS <Code>linear()</Code> easings, so they work in plain CSS transitions with no JavaScript. Each has a matching <Code>-duration</Code> variable (the time the spring needs to settle).
        </P>
        <SpringDemo />
        <CodeBlock
          lang="css"
          code={`.thumb {
  transition: transform var(--ui-spring-smooth-duration) var(--ui-spring-smooth);
}`}
        />
      </Section>

      <Section id="tokens" title="Tokens">
        <CodeBlock
          lang="css"
          code={`--ui-duration-instant: 100ms;   --ui-ease-out: cubic-bezier(.22, 1, .36, 1);
--ui-duration-fast:    150ms;   --ui-ease-in:  cubic-bezier(.55, 0, 1, .45);
--ui-duration-exit:    160ms;   --ui-ease-standard: cubic-bezier(.2, 0, 0, 1);
--ui-duration:         220ms;   --ui-spring-snappy | smooth | morph (+ -duration)
--ui-duration-slow:    380ms;   --ui-stagger: 35ms;`}
        />
        <P>
          Keyframes: <Code>ui-rise-in</Code>, <Code>ui-pop-in</Code> / <Code>ui-pop-out</Code>, <Code>ui-fade-in</Code> / <Code>ui-fade-out</Code>, <Code>ui-slide-in-*</Code> / <Code>ui-slide-out-*</Code>, <Code>ui-spin</Code>, <Code>ui-shimmer</Code>, <Code>ui-draw</Code>. Tailwind: <Code>animate-rise</Code>, <Code>animate-pop</Code>, <Code>animate-fade</Code>, <Code>animate-shimmer</Code>. Helpers: <Code>ui-animate-rise</Code>, <Code>ui-stagger</Code>.
        </P>
      </Section>

      <Section id="stagger" title="Stagger">
        <ul className="ui-stagger mb-6 grid gap-2">
          {['Deployment succeeded', 'Preview ready for review', 'Build cache is 82% full', 'Certificate renews in 3 days'].map((t) => (
            <li key={t} className="rounded-lg border border-border bg-card px-4 py-3 text-base">
              {t}
            </li>
          ))}
        </ul>
        <P>
          <Code>ui-stagger</Code> rises children in 35ms apart (total under 400ms). Reload the page to see it again.
        </P>
      </Section>
    </DocPage>
  );
}
