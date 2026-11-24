import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import NavbarMarketing from '@/examples/navbar/marketing';
import NavbarUnderline from '@/examples/navbar/underline';
import NavbarFloating from '@/examples/navbar/floating';
import NavbarNarrow from '@/examples/navbar/narrow';

export const metadata: Metadata = { title: 'Navbar' };

export default function NavbarPage() {
  return (
    <DocPage href="/docs/components/navbar" wide>
      <Section id="usage" title="Usage">
        <P>
          A sticky site header with a blurred backdrop. The bottom border fades in once the page scrolls (scroll the preview). The active link gets a pill that glides between links on the morph spring; below 768px of its own width the links move into a menu in a sheet.
        </P>
        <Example component="navbar" file="navbar/marketing" title="Marketing navbar" align="stretch">
          <NavbarMarketing />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Marketing sites, documentation and apps with a handful of top-level destinations.',
            'Anywhere the main navigation should stay reachable while scrolling.',
          ]}
        />
        <P>Not for: apps with many sections and nested pages (use a sidebar), or menus with rich panels (put a navigation menu inside the navbar).</P>
      </Section>

      <Section id="underline" title="Underline indicator">
        <P>
          <Code>{'indicator="underline"'}</Code> on <Code>NavbarNav</Code> makes the links as tall as the navbar and draws a 2px bar on its bottom edge instead of a pill.
        </P>
        <Example component="navbar" file="navbar/underline" title="Underline" align="stretch">
          <NavbarUnderline />
        </Example>
      </Section>

      <Section id="floating" title="Floating">
        <P><Code>{'variant="floating"'}</Code> is a rounded pill with a shadow that hovers 12px below the top edge.</P>
        <Example component="navbar" file="navbar/floating" title="Floating pill" align="stretch">
          <NavbarFloating />
        </Example>
      </Section>

      <Section id="mobile" title="Mobile menu">
        <P>
          The navbar measures its own width, so it collapses inside a narrow container as well as on a phone. The menu is a <Code>Sheet</Code>; it closes when a link inside it is clicked, when <Code>routeKey</Code> changes (pass <Code>usePathname()</Code>) and on back / forward.
        </P>
        <Example component="navbar" file="navbar/narrow" title="Collapsed navbar" align="stretch">
          <NavbarNarrow />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Navbar"
          rows={[
            { name: 'variant', type: "'default' | 'floating'", default: "'default'", description: 'Full-width bar with a bottom border, or a floating pill.' },
            { name: 'sticky', type: 'boolean', default: 'true', description: 'Stick to the top of the scroll container.' },
            { name: 'routeKey', type: 'string', description: 'Changes on navigation; closes the mobile menu.' },
            { name: 'mobileOpen / defaultMobileOpen / onMobileOpenChange', type: 'boolean / boolean / (open) => void', description: 'Control the mobile menu.' },
          ]}
        />
        <PropsTable
          title="NavbarNav"
          rows={[{ name: 'indicator', type: "'pill' | 'underline'", default: "'pill'", description: 'Style of the gliding highlight.' }]}
        />
        <PropsTable
          title="NavbarLink / NavbarBrand"
          rows={[
            { name: 'active', type: 'boolean', description: 'NavbarLink only: the current page (aria-current="page" and the highlight).' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element, e.g. a Next.js Link.' },
          ]}
        />
        <P>
          <Code>NavbarActions</Code> holds the buttons on the right (add the class <Code>ui-navbar-hide-narrow</Code> to one that should disappear when collapsed). <Code>NavbarMobileToggle</Code> is the menu button; <Code>NavbarMobileMenu</Code> takes <Code>title</Code> and <Code>side</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves through the brand, links and actions.'],
            ['Enter', 'Follows a link or opens the menu.'],
            ['Esc', 'Closes the mobile menu and returns focus to its button.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A header landmark with a labelled nav (“Main”); the current page has aria-current="page".',
            'The menu button reports aria-expanded and opens a modal sheet with a title and focus containment.',
            'The border and blur are decoration only; text contrast is the same scrolled or not.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The highlight glides on the morph spring; the first placement never animates.',
            'The border fades in over 220ms when scrolling starts.',
            'The mobile sheet slides in on the smooth spring. Reduced motion drops the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
