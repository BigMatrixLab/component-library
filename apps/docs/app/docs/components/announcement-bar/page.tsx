import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AnnouncementBarVariants from '@/examples/announcement-bar/variants';
import AnnouncementBarRemember from '@/examples/announcement-bar/remember';

export const metadata: Metadata = { title: 'Announcement bar' };

export default function AnnouncementBarPage() {
  return (
    <DocPage href="/docs/components/announcement-bar">
      <Section id="variants" title="Variants">
        <P>
          A strip across the top of the page. <Code>neutral</Code> for notices, <Code>primary</Code> for a launch, <Code>gradient-subtle</Code> for marketing moments. Dismiss one: it collapses and the content below glides up.
        </P>
        <Example component="announcement-bar" file="announcement-bar/variants" title="Variants" align="stretch">
          <AnnouncementBarVariants />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Site-wide news: a launch, a pricing change, an event.',
            'A planned maintenance window everyone should see before it happens.',
          ]}
        />
        <P>
          Not for: feedback on something the user just did (use a toast), problems inside a form or section (use an alert), anything that must block the page (use a dialog). Show one bar at a time.
        </P>
      </Section>

      <Section id="remember" title="Remember the dismissal">
        <P>
          <Code>storageKey</Code> stores the dismissal in localStorage. The server always renders the bar; after hydration a stored dismissal removes it at once, without animation. Use a new key for each announcement. This example is also controlled with <Code>open</Code> and <Code>onOpenChange</Code>.
        </P>
        <Example component="announcement-bar" file="announcement-bar/remember" title="Remember the dismissal" align="stretch">
          <AnnouncementBarRemember />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="AnnouncementBar"
          rows={[
            { name: 'variant', type: "'neutral' | 'primary' | 'gradient-subtle'", default: "'neutral'", description: 'Surface.' },
            { name: 'open', type: 'boolean', description: 'Controlled visibility.' },
            { name: 'defaultOpen', type: 'boolean', default: 'true', description: 'Initial visibility when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the bar is dismissed (or hidden from storage).' },
            { name: 'dismissible', type: 'boolean', default: 'true', description: 'Show the × button.' },
            { name: 'dismissLabel', type: 'string', default: "'Dismiss announcement'", description: 'Accessible name of the × button.' },
            { name: 'storageKey', type: 'string', description: 'Remember the dismissal in localStorage under this key.' },
            { name: 'icon', type: 'ReactNode', description: 'Leading icon or AnnouncementBarBadge.' },
            { name: 'action', type: 'ReactNode', description: 'Usually an AnnouncementBarLink.' },
            { name: 'aria-label', type: 'string', default: "'Announcement'", description: 'Name of the region landmark.' },
          ]}
        />
        <PropsTable
          title="AnnouncementBarLink"
          rows={[
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render your element (e.g. a Next.js Link) with the link styles and arrow.' },
            { name: 'arrow', type: 'boolean', default: 'true', description: 'Trailing arrow that nudges on hover.' },
            { name: '...props', type: 'AnchorHTMLAttributes', description: 'Forwarded to <a>.' },
          ]}
        />
        <P>
          <Code>AnnouncementBarBadge</Code> is a small pill (“New”, “Beta”) to pass as <Code>icon</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves to the link, then the × button.'],
            ['Enter / Space', 'Activates the focused link or dismisses the bar.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A region landmark named by aria-label, so screen-reader users can find or skip it. Give each bar on a page its own name.',
            'The × is a real button with an accessible name; it has a 44px touch target without making the strip taller.',
            'No role="alert": an announcement is part of the page, so it does not interrupt.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Dismiss: the height collapses (280ms) while the strip fades and lifts 4px with a light blur, so the page glides up instead of jumping.',
            'Showing it again after load opens it on the smooth spring; the first render never animates.',
            'The link arrow nudges 2px on hover (fine pointers only).',
            'Reduced motion: the bar disappears without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
