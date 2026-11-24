import type { Metadata } from 'next';
import { Code, DocPage, List, P, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import SettingsSidebarTabs from '@/examples/blocks/settings/sidebar-tabs';

export const metadata: Metadata = { title: 'Settings block' };

export default function SettingsBlockPage() {
  return (
    <DocPage href="/docs/blocks/settings" wide>
      <Section id="sidebar-tabs" title="Settings with sidebar tabs">
        <P>
          Four sections behind vertical <Code>Tabs</Code>: account, notifications, billing and a danger zone. When the block is narrower than 42rem the tabs become a
          scrolling row above the content, and the arrow keys follow (Left/Right instead of Up/Down).
        </P>
        <Example component="blocks/settings" file="blocks/settings/sidebar-tabs" title="Settings with sidebar tabs" align="stretch" minHeight={900}>
          <SettingsSidebarTabs />
        </Example>
      </Section>

      <Section id="sections" title="What each section shows">
        <List
          items={[
            'Account: avatar with upload and remove, name, display name, a read-only verified email, a bio with a character count and a time zone. Save validates the name.',
            'Notifications: email switches with descriptions (one locked on for paid plans) and a radio group for push notifications.',
            'Billing: the current plan with renewal date, seat and storage meters that turn amber at 80%, the payment card and an invoice table.',
            'Danger zone: transfer, export and delete. Delete opens an alert dialog that only enables the button once the workspace name is typed exactly, then shows a restorable warning.',
          ]}
        />
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Account or workspace settings with three to eight sections that each fit on one screen.',
            'Not for: dozens of sections (use a sidebar with grouped links and real routes), or a single short form (use a page or a sheet).',
          ]}
        />
      </Section>

      <Section id="behaviour" title="Behaviour">
        <List
          items={[
            'Each section saves on its own; the save bar shows a spinner on the button, then a “Saved” status that clears on the next edit.',
            'Destructive actions live together at the end, in a bordered group tinted with the destructive colour, and always need confirmation.',
            'In an app, give each section its own route (for example /settings/billing) and drive Tabs with value / onValueChange so the URL and the tab agree.',
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Tabs follow the WAI-ARIA tabs pattern with aria-orientation matching the layout.',
            'Each panel has one h2; groups inside use h3 and are labelled sections.',
            'Switches carry their label and description; the locked switch is disabled and explains why in its description.',
            'The delete confirmation is role="alertdialog" and cannot be dismissed while the request runs.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
