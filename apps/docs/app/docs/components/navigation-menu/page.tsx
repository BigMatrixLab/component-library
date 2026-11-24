import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import NavigationMenuProducts from '@/examples/navigation-menu/products';
import NavigationMenuAccordion from '@/examples/navigation-menu/accordion';

export const metadata: Metadata = { title: 'Navigation menu' };

export default function NavigationMenuPage() {
  return (
    <DocPage href="/docs/components/navigation-menu" wide>
      <Section id="usage" title="Usage">
        <P>
          Every trigger shares <strong>one</strong> floating panel. Hover a trigger (with a short intent delay) or click it; moving to another trigger resizes the panel, slides the new content in from the side you travelled and glides the caret under the active trigger.
        </P>
        <Example component="navigation-menu" file="navigation-menu/products" title="Products and resources" align="stretch" minHeight={360}>
          <NavigationMenuProducts />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Site headers whose sections each hold a handful of destinations that need a title and a line of description.',
            'Next to a logo and call-to-action in a navbar, on desktop widths.',
          ]}
        />
        <P>Not for: lists of commands or actions (use a dropdown menu) or app navigation with many levels (use a sidebar).</P>
      </Section>

      <Section id="accordion" title="Accordion on narrow screens">
        <P>
          Below <Code>collapseBelow</Code> (768px) the menu becomes an accordion: each trigger expands its links in place. Force it with <Code>{'mode="accordion"'}</Code>, for example when the menu sits inside the mobile navbar sheet.
        </P>
        <Example component="navigation-menu" file="navigation-menu/accordion" title="Accordion" align="stretch">
          <NavigationMenuAccordion />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="NavigationMenu"
          rows={[
            { name: 'value / defaultValue / onValueChange', type: 'string / string / (value) => void', default: "''", description: 'The open item’s value; empty when closed.' },
            { name: 'mode', type: "'auto' | 'menu' | 'accordion'", default: "'auto'", description: 'auto switches by viewport width.' },
            { name: 'collapseBelow', type: 'number', default: '768', description: 'Viewport width (px) for the accordion in auto mode.' },
            { name: 'openDelay / closeDelay', type: 'number', default: '120 / 240', description: 'Hover intent, in ms.' },
          ]}
        />
        <PropsTable
          title="NavigationMenuItem / NavigationMenuLink"
          rows={[
            { name: 'value', type: 'string', description: 'Item only: identifies the item. Defaults to a generated id.' },
            { name: 'active', type: 'boolean', description: 'Link only: aria-current="page".' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Link only: render the child element, e.g. a Next.js Link.' },
          ]}
        />
        <P>
          Also: <Code>NavigationMenuList</Code>, <Code>NavigationMenuTrigger</Code>, <Code>NavigationMenuContent</Code>, <Code>NavigationMenuLinkTitle</Code> and <Code>NavigationMenuLinkDescription</Code>. Lay content out with the <Code>ui-nav-menu-grid</Code> class and its <Code>--ui-nav-cols</Code> / <Code>--ui-nav-width</Code> variables.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['← →', 'Between triggers and links; switches the open panel.'],
            ['↓', 'Opens the panel and moves into it. Inside, arrows move between links.'],
            ['↑', 'From the first link, back to the trigger.'],
            ['Enter / Space', 'Toggles the panel (focus stays on the trigger).'],
            ['Tab', 'From an open trigger, into the panel.'],
            ['Esc', 'Closes the panel and returns focus to its trigger.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A labelled nav landmark; triggers are buttons with aria-expanded and aria-controls (the disclosure navigation pattern).',
            'The panel is in the top layer, so no parent can clip it. Focus leaving the menu closes it.',
            'Hover never opens a panel on touch screens; tapping does.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'First open: the panel rises in from the caret (soft rise).',
            'Between items: the panel moves and resizes on the smooth spring, the old content leaves and the new content enters from the side of travel; the caret glides under the active trigger.',
            'Reduced motion keeps the state change and drops the movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
