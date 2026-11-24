import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';

export const metadata: Metadata = { title: 'Introduction' };

export default function IntroductionPage() {
  return (
    <DocPage href="/docs/introduction">
      <Section id="what" title="What it is">
        <P>
          ui-kit is our own React component library for React and Next.js. It is calm and professional by default, has a quiet motion signature, and owns everything it ships: components, positioning, toasts, charts and themes. React is the only peer dependency.
        </P>
        <List
          items={[
            <>Styles are Tailwind v4 classes named <Code>ui-*</Code>, in Tailwind’s components layer, so any utility in <Code>className</Code> overrides them.</>,
            'Components are typed, controlled or uncontrolled, forward refs and accept asChild where useful.',
            'Overlays use the browser’s top layer (native <dialog> and the Popover API), so nothing gets clipped.',
            'Every example ships with an AI prompt that rebuilds it, verified by an independent agent.',
          ]}
        />
      </Section>
      <Section id="principles" title="Principles">
        <List
          items={[
            'Colour is spent on intent: the primary action, the selection, status. Everything else stays neutral.',
            'Motion explains cause and effect, never decorates. Reduced motion is always respected.',
            'Accessibility follows the WAI-ARIA Authoring Practices and is tested with axe in Chromium, WebKit and Firefox.',
            'Customise in steps: use as-is → change tokens → add utilities → style ui-* classes → copy the source.',
          ]}
        />
      </Section>
      <Section id="status" title="Status">
        <P>
          Phase 0 (foundation) is in review: tokens, motion, primitives, Button, Dialog, docs, tests and the prompt system. Components marked “soon” in the sidebar are planned for Phase 1.
        </P>
      </Section>
    </DocPage>
  );
}
