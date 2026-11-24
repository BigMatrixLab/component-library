import type { Metadata } from 'next';
import { Code, DocPage, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AlertVariants from '@/examples/alert/variants';
import AlertActionsExample from '@/examples/alert/actions';
import AlertBanner from '@/examples/alert/banner';
import AlertDismissible from '@/examples/alert/dismissible';

export const metadata: Metadata = { title: 'Alert' };

export default function AlertPage() {
  return (
    <DocPage href="/docs/components/alert">
      <Section id="variants" title="Variants">
        <P>A tinted panel with a coloured icon. Text uses the status <Code>-text</Code> tokens, so contrast holds in light and dark.</P>
        <Example component="alert" file="alert/variants" title="Variants" align="start">
          <AlertVariants />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A message that belongs to the page and stays until the situation changes: a failed payment, a limit reached, a verified domain.',
            'Context for a whole section or screen, with an action to resolve it.',
          ]}
        />
        <P>Not for: a confirmation of something the user just did (use a toast), a decision that blocks the user (use a dialog), or field-level errors (put them next to the field).</P>
      </Section>

      <Section id="actions" title="With actions">
        <P>Put buttons in <Code>AlertActions</Code>. Use small buttons; one primary at most.</P>
        <Example component="alert" file="alert/actions" title="With actions" align="start">
          <AlertActionsExample />
        </Example>
      </Section>

      <Section id="banner" title="Banner">
        <P><Code>banner</Code> makes a full-width strip with square corners and no side borders, for the top of a page or panel.</P>
        <Example component="alert" file="alert/banner" title="Banner" align="stretch">
          <AlertBanner />
        </Example>
      </Section>

      <Section id="dismissible" title="Dismissible">
        <P><Code>DismissibleAlert</Code> adds a × button. It fades and collapses away so the content below glides up, then unmounts. Control it with <Code>open</Code> or let it manage itself.</P>
        <Example component="alert" file="alert/dismissible" title="Dismissible" align="start">
          <AlertDismissible />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Alert"
          rows={[
            { name: 'variant', type: "'default' | 'info' | 'success' | 'warning' | 'destructive'", default: "'default'", description: 'Meaning and colour. Each status variant has its own icon.' },
            { name: 'banner', type: 'boolean', default: 'false', description: 'Full-width strip, square corners, no side borders.' },
            { name: 'icon', type: 'ReactNode | false', description: 'Replace the icon, or false for none.' },
            { name: 'role', type: "'alert' | 'status'", description: 'None by default. See Accessibility.' },
            { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Forwarded to the root, including ref and className.' },
          ]}
        />
        <PropsTable
          title="DismissibleAlert"
          rows={[
            { name: 'open / defaultOpen / onOpenChange', type: 'boolean', default: 'true', description: 'Controlled or uncontrolled visibility.' },
            { name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: 'Accessible name of the × button.' },
            { name: '...props', type: 'AlertProps', description: 'Everything Alert accepts.' },
          ]}
        />
        <P>Parts: <Code>AlertTitle</Code>, <Code>AlertDescription</Code>, <Code>AlertActions</Code>. <Code>Alert</Code> is a Server Component–safe element; only <Code>DismissibleAlert</Code> is a client component.</P>
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            <>An alert is page content, so it has <Code>no role</Code> by default and is read in order with the rest of the page.</>,
            <>Add <Code>role=&quot;alert&quot;</Code> only for something urgent that appears because of what the user just did (a failed save, a declined payment): screen readers interrupt whatever they are saying. Do not use it for messages present on load.</>,
            <>Use <Code>role=&quot;status&quot;</Code> for a polite update that appears after load (for example, “Sync complete”).</>,
            'Colour is never the only signal: every status variant has an icon and a title.',
            'The × button is a real button with a label; keyboard focus shows a ring.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Dismissing fades the alert out and collapses its height over 220ms so nothing jumps.',
            'Reduced motion: the alert still disappears, without the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
