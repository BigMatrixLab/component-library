import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';

export const metadata: Metadata = { title: 'AI prompts' };

export default function AiPromptsPage() {
  return (
    <DocPage href="/docs/ai-prompts">
      <Section id="what" title="What they are">
        <P>
          Every example has a <strong className="font-medium text-foreground">Prompt</strong> tab next to Preview and Code. Copy it, paste it into any AI tool (Claude, ChatGPT, Cursor, v0…) and you get the same component, in a project that doesn’t have ui-kit installed.
        </P>
      </Section>
      <Section id="modes" title="Two modes">
        <List
          items={[
            <><strong className="font-medium text-foreground">Recreate</strong> — the design system in exact values, the component spec, the full reference source and the example. Rebuilds exactly what you see.</>,
            <><strong className="font-medium text-foreground">Adapt</strong> — the design system and spec without our source, plus a section for your own content. Same look and behaviour, your copy and variant; small layout differences are possible because AI output varies.</>,
          ]}
        />
      </Section>
      <Section id="inside" title="What a prompt contains">
        <List
          items={[
            'Role and goal, and a rule not to redesign or add dependencies.',
            'The design system: visual language, motion, conventions, and every token file verbatim.',
            'The component spec: anatomy, props, behaviour, visuals, motion, accessibility and acceptance checks.',
            'Recreate only: every source file the component needs, then the example to render.',
            'The output format.',
          ]}
        />
        <P>
          Prompts are generated from the same files the library is built from (<Code>prompts/</Code> + <Code>packages/ui/src</Code>), so they can’t drift from the code. Plain-text versions: <Code>/prompts/&lt;component&gt;/&lt;example&gt;?mode=recreate</Code>.
        </P>
      </Section>
      <Section id="verified" title="How they are verified">
        <List
          items={[
            'A fresh AI agent receives only the prompt (no access to our repo) and writes its output.',
            'The output is rendered in an isolated app that does not depend on ui-kit.',
            'A script compares it with our reference element by element — computed styles and pixels — in Chromium and WebKit, light and dark.',
            'A prompt ships only when that comparison passes.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
