import type { Metadata } from 'next';
import { Icon, iconPaths, type IconName } from 'ui-kit';
import { Code, DocPage, P, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';

export const metadata: Metadata = { title: 'Icons' };

export default function IconsPage() {
  const names = Object.keys(iconPaths) as IconName[];
  return (
    <DocPage href="/docs/foundations/icons" wide>
      <Section id="usage" title="Usage">
        <P>
          {names.length} stroke icons on a 24px grid (Lucide shapes, ISC licence), stroke 1.75, colour from <Code>currentColor</Code>. Decorative by default (<Code>aria-hidden</Code>); pass <Code>label</Code> when the icon carries meaning on its own. Server Component–safe.
        </P>
        <CodeBlock lang="tsx" code={`<Icon name="check" />\n<Icon name="search" size={20} label="Search" />`} />
      </Section>
      <Section id="all" title="All icons">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {names.map((n) => (
            <div key={n} className="flex flex-col items-center gap-2 rounded-lg border border-border px-2 py-4 text-xs text-muted-foreground">
              <Icon name={n} size={20} className="text-foreground" />
              <span className="font-mono">{n}</span>
            </div>
          ))}
        </div>
      </Section>
    </DocPage>
  );
}
