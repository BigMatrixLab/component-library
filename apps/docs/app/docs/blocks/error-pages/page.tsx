import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import NotFoundPage from '@/examples/blocks/error-pages/not-found';
import ServerErrorPage from '@/examples/blocks/error-pages/server-error';

export const metadata: Metadata = { title: 'Error page blocks' };

export default function ErrorPagesBlockPage() {
  return (
    <DocPage href="/docs/blocks/error-pages" wide>
      <Section id="not-found" title="404, page not found">
        <P>
          A calm illustration drawn from plain shapes, the path that failed, a search box and a way home. Searching filters the popular pages below; an empty search
          shows a message under the field instead of doing nothing.
        </P>
        <Example component="blocks/error-pages" file="blocks/error-pages/not-found" title="404, page not found" align="stretch" minHeight={820}>
          <NotFoundPage />
        </Example>
      </Section>

      <Section id="server-error" title="500, server error">
        <P>
          Says plainly that the fault is on our side, offers a retry and a way out, and gives an error ID with a copy button for support. In this demo the first retry
          still fails and the second recovers.
        </P>
        <Example component="blocks/error-pages" file="blocks/error-pages/server-error" title="500, server error" align="stretch" minHeight={680}>
          <ServerErrorPage />
        </Example>
      </Section>

      <Section id="nextjs" title="Using them in Next.js">
        <List
          items={[
            <>
              404: render the block from <Code>app/not-found.tsx</Code>. Replace the hard-coded path with the requested one if you have it.
            </>,
            <>
              500: render it from <Code>app/error.tsx</Code> (a client component) and call the <Code>reset()</Code> it receives from Try again. Show{' '}
              <Code>error.digest</Code> as the error ID.
            </>,
            'Keep the HTTP status right: not-found.tsx returns 404 for you; don’t render a 404 block with a 200 status.',
          ]}
        />
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Full-page errors: a missing route, a crashed page, a failed server render.',
            'Not for: a failed widget inside a working page (use an Alert or an empty state in place), or an empty list (use Empty state).',
          ]}
        />
      </Section>

      <Section id="writing" title="Writing">
        <List
          items={[
            'Say what happened in plain words, whose fault it is, and what to do next. No jokes about broken robots when someone is blocked.',
            'Lead with the code in small mono type; the heading is the human sentence.',
            'Always give two ways forward: one primary (home or retry) and one secondary (search or support).',
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'The illustrations are decorative (aria-hidden); the heading carries the meaning.',
            'The search form is a role="search" landmark, the input has an accessible name and errors are announced.',
            'Retry results are announced through a status region; when the page recovers, focus moves to that message.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
