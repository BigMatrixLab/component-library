import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import AccordionFaq from '@/examples/accordion/faq';
import AccordionVariants from '@/examples/accordion/variants';
import AccordionCollapsible from '@/examples/accordion/collapsible';
import AccordionFindInPage from '@/examples/accordion/find-in-page';

export const metadata: Metadata = { title: 'Accordion' };

export default function AccordionPage() {
  return (
    <DocPage href="/docs/components/accordion">
      <Section id="usage" title="Usage">
        <P>
          An accordion is a stack of headings that each reveal a region. Height animates on the smooth spring and follows the content, with nothing measured in JavaScript. <Code>type=&quot;single&quot;</Code> keeps one item open; <Code>type=&quot;multiple&quot;</Code> allows any number.
        </P>
        <Example component="accordion" file="accordion/faq" title="FAQ" align="start">
          <AccordionFaq />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Content that people scan and open selectively: FAQs, settings groups, filters.',
            'Use Collapsible for a single region (“show more”).',
          ]}
        />
        <P>Not for: content everyone needs to read (just show it), switching between peer views (use tabs).</P>
      </Section>

      <Section id="variants" title="Variants">
        <P>
          <Code>default</Code> divides items with a line, <Code>cards</Code> separates them as surfaces, <Code>flush</Code> drops the lines and tightens the spacing. Items can be disabled one by one or all at once.
        </P>
        <Example component="accordion" file="accordion/variants" title="Variants" align="start">
          <AccordionVariants />
        </Example>
      </Section>

      <Section id="collapsible" title="Collapsible">
        <P>
          <Code>Collapsible</Code>, <Code>CollapsibleTrigger</Code> and <Code>CollapsibleContent</Code> are the same animated region without the group: one trigger, one region, <Code>open</Code> / <Code>defaultOpen</Code> / <Code>onOpenChange</Code>.
        </P>
        <Example component="accordion" file="accordion/collapsible" title="Show more">
          <AccordionCollapsible />
        </Example>
      </Section>

      <Section id="find-in-page" title="Find in page">
        <P>
          Closed content stays in the DOM with <Code>hidden=&quot;until-found&quot;</Code>. In browsers that support it (Chromium), Ctrl + F finds text inside a closed item and opens it. Elsewhere the content is hidden normally.
        </P>
        <Example component="accordion" file="accordion/find-in-page" title="Find in page" align="start">
          <AccordionFindInPage />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Accordion"
          rows={[
            { name: 'type', type: "'single' | 'multiple'", description: 'Required. One open item at a time, or any number.' },
            { name: 'value', type: 'string | string[]', description: 'Controlled open item(s): a string for single, an array for multiple.' },
            { name: 'defaultValue', type: 'string | string[]', description: 'Initially open item(s) when uncontrolled.' },
            { name: 'onValueChange', type: '(value) => void', description: 'Called with the new value (string for single, string[] for multiple).' },
            { name: 'collapsible', type: 'boolean', default: 'false', description: "single only: allow the open item to be closed again." },
            { name: 'variant', type: "'default' | 'cards' | 'flush'", default: "'default'", description: 'Divided, separated surfaces, or flush.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable every item.' },
          ]}
        />
        <PropsTable
          title="AccordionItem"
          rows={[
            { name: 'value', type: 'string', description: 'Required. Identifies the item in the accordion value.' },
            { name: 'disabled', type: 'boolean', description: 'Disable this item.' },
          ]}
        />
        <PropsTable
          title="AccordionTrigger"
          rows={[{ name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'Heading that wraps the button, so the outline fits your page.' }]}
        />
        <PropsTable
          title="Collapsible"
          rows={[
            { name: 'open', type: 'boolean', description: 'Controlled open state.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the region asks to open or close.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Ignore the trigger.' },
          ]}
        />
        <P>
          <Code>CollapsibleTrigger</Code> accepts <Code>asChild</Code> to use your own button. <Code>AccordionContent</Code> and <Code>CollapsibleContent</Code> hold the revealed content.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Enter / Space', 'Opens or closes the focused item.'],
            ['↓', 'Moves focus to the next header; wraps around.'],
            ['↑', 'Moves focus to the previous header; wraps around.'],
            ['Home / End', 'First / last header.'],
            ['Tab', 'Moves through headers and the focusable content of open items.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA accordion pattern: each trigger is a button inside a heading with aria-expanded and aria-controls; the region is labelled by its trigger.',
            'Closed content is not focusable and not read by screen readers.',
            'Disabled items stay in the order but cannot be opened or focused.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Open: the row grows from 0 to its content height on the smooth spring (about 540ms, no overshoot) while the content fades in.',
            'Close: 260ms, so it leaves quicker than it arrives. The chevron turns 180 degrees in 220ms.',
            'An item that starts open does not animate on load.',
            'Reduced motion: it opens and closes without movement.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
