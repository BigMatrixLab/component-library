import type { Metadata } from 'next';
import { Code, DocPage, P, Section } from '@/components/docs/doc';
import { CodeBlock } from '@/components/docs/code-block';

export const metadata: Metadata = { title: 'Installation' };

export default function InstallationPage() {
  return (
    <DocPage href="/docs/installation">
      <Section id="install" title="Install">
        <P>The package is not on npm yet (Phase 6). Inside this monorepo, apps depend on it as a workspace package.</P>
        <CodeBlock lang="bash" code={`npm install ui-kit   # after it is published`} />
      </Section>
      <Section id="css" title="Add the styles">
        <P>If your app runs Tailwind v4, import the kit after Tailwind so its tokens and classes join your build:</P>
        <CodeBlock
          lang="css"
          title="app/globals.css"
          code={`@import "tailwindcss";
@import "ui-kit/kit.css";`}
        />
        <P>
          No Tailwind? Import the prebuilt stylesheet instead: <Code>import &apos;ui-kit/styles.css&apos;</Code>.
        </P>
      </Section>
      <Section id="theme" title="Add the theme script">
        <CodeBlock
          lang="tsx"
          title="app/layout.tsx"
          code={`import { ThemeScript } from 'ui-kit';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
        />
        <P>
          It applies the saved light/dark mode and accent before the first paint. Change them anywhere with <Code>useTheme()</Code>.
        </P>
      </Section>
      <Section id="use" title="Use a component">
        <CodeBlock
          lang="tsx"
          code={`import { Button, Icon } from 'ui-kit';

export function SaveBar() {
  return (
    <Button>
      <Icon name="check" />
      Save changes
    </Button>
  );
}`}
        />
        <P>
          Interactive components carry <Code>&apos;use client&apos;</Code> themselves, so you can render them from Server Components; pass event handlers from a client component.
        </P>
      </Section>
    </DocPage>
  );
}
