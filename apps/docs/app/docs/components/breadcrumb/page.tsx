import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import BreadcrumbBasic from '@/examples/breadcrumb/basic';
import BreadcrumbSlash from '@/examples/breadcrumb/slash';
import BreadcrumbCollapsed from '@/examples/breadcrumb/collapsed';
import BreadcrumbAsLink from '@/examples/breadcrumb/as-link';

export const metadata: Metadata = { title: 'Breadcrumb' };

export default function BreadcrumbPage() {
  return (
    <DocPage href="/docs/components/breadcrumb">
      <Section id="usage" title="Usage">
        <P>
          A <Code>nav</Code> with an ordered list. Ancestors are links, the last item is the current page and is announced with <Code>{'aria-current="page"'}</Code>.
        </P>
        <Example component="breadcrumb" file="breadcrumb/basic" title="Basic" align="start">
          <BreadcrumbBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Sites and apps with a real hierarchy three or more levels deep: projects, folders, documentation.',
            'Pages people reach from search or a shared link, where “where am I?” is not obvious.',
          ]}
        />
        <P>Not for: flat sites, wizard steps (use a stepper) or a record of the pages someone visited.</P>
      </Section>

      <Section id="separator" title="Separator">
        <P>Chevrons by default. Set <Code>{'separator="slash"'}</Code> on the breadcrumb for paths and repositories, or pass your own children to <Code>BreadcrumbSeparator</Code>.</P>
        <Example component="breadcrumb" file="breadcrumb/slash" title="Slash separator" align="start">
          <BreadcrumbSlash />
        </Example>
      </Section>

      <Section id="collapsed" title="Collapsed middle">
        <P>
          <Code>BreadcrumbEllipsis</Code> is a button, so it can open a dropdown menu holding the hidden levels. Collapse the middle, never the first or last item.
        </P>
        <Example component="breadcrumb" file="breadcrumb/collapsed" title="Collapsed with a menu" align="start">
          <BreadcrumbCollapsed />
        </Example>
      </Section>

      <Section id="as-child" title="As a link">
        <P><Code>asChild</Code> renders your element, such as a Next.js <Code>Link</Code>, with the breadcrumb link styles.</P>
        <Example component="breadcrumb" file="breadcrumb/as-link" title="With Next.js Link" align="start">
          <BreadcrumbAsLink />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Breadcrumb"
          rows={[
            { name: 'separator', type: "'chevron' | 'slash'", default: "'chevron'", description: 'Glyph drawn by every BreadcrumbSeparator without children.' },
            { name: '...props', type: 'HTMLAttributes<HTMLElement>', description: 'Forwarded to the nav. aria-label defaults to "Breadcrumb".' },
          ]}
        />
        <PropsTable
          title="BreadcrumbLink"
          rows={[
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element with the link styles.' },
            { name: '...props', type: 'AnchorHTMLAttributes', description: 'Forwarded to the anchor.' },
          ]}
        />
        <P>
          <Code>BreadcrumbList</Code> (ol), <Code>BreadcrumbItem</Code> (li), <Code>BreadcrumbPage</Code> (current page), <Code>BreadcrumbSeparator</Code> and <Code>BreadcrumbEllipsis</Code> (button) forward their ref, className and native props.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Tab', 'Moves through the links and the ellipsis button.'], ['Enter', 'Follows a link or opens the ellipsis menu.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'WAI-ARIA breadcrumb pattern: nav landmark labelled “Breadcrumb”, an ordered list, aria-current="page" on the last item.',
            'Separators are decorative (aria-hidden) so screen readers read only the levels.',
            'Long names wrap instead of overflowing; the ellipsis button is labelled “Show hidden pages”.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Links and the ellipsis change colour in 150ms; nothing moves.',
            'Hover styles only apply to fine pointers.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
