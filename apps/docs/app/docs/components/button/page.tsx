import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import ButtonVariants from '@/examples/button/variants';
import ButtonSizes from '@/examples/button/sizes';
import ButtonWithIcons from '@/examples/button/icons';
import ButtonLoading from '@/examples/button/loading';
import ButtonAsLink from '@/examples/button/as-link';
import ButtonGroupExample from '@/examples/button/group';

export const metadata: Metadata = { title: 'Button' };

export default function ButtonPage() {
  return (
    <DocPage href="/docs/components/button">
      <Section id="variants" title="Variants">
        <P>One primary action per surface. Secondary, outline and ghost carry less weight; soft tints with the accent; destructive is for actions that delete or can’t be undone.</P>
        <Example component="button" file="button/variants" title="Variants">
          <ButtonVariants />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Any single action on a page, form or dialog: Save, Continue, Cancel.',
            'Short async work where a spinner on the button is enough feedback — use loading.',
            <>Navigation that should look like an action — wrap a link with <Code>asChild</Code>.</>,
          ]}
        />
        <P>Not for: plain navigation inside text (use a link), on/off settings (use a switch), choosing one of a few views (use a segmented control).</P>
      </Section>

      <Section id="sizes" title="Sizes">
        <P>28, 32, 36 and 44px tall. Use <Code>lg</Code> for the main call to action on touch screens.</P>
        <Example component="button" file="button/sizes" title="Sizes">
          <ButtonSizes />
        </Example>
      </Section>

      <Section id="icons" title="With icons">
        <P>Put an <Code>Icon</Code> before or after the label. Icon-only buttons use <Code>icon</Code> and always need an <Code>aria-label</Code>.</P>
        <Example component="button" file="button/icons" title="With icons">
          <ButtonWithIcons />
        </Example>
      </Section>

      <Section id="loading" title="Loading and disabled">
        <P>
          <Code>loading</Code> shows a spinner, keeps the width and swallows clicks. It uses <Code>aria-busy</Code> instead of <Code>disabled</Code>, so keyboard focus is not lost mid-action. Click the first button.
        </P>
        <Example component="button" file="button/loading" title="Loading and disabled">
          <ButtonLoading />
        </Example>
      </Section>

      <Section id="as-child" title="As a link">
        <P><Code>asChild</Code> renders your element (here a Next.js <Code>Link</Code>) with the button’s styles and behaviour.</P>
        <Example component="button" file="button/as-link" title="As a link">
          <ButtonAsLink />
        </Example>
      </Section>

      <Section id="group" title="Button group">
        <Example component="button" file="button/group" title="Button group">
          <ButtonGroupExample />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Button"
          rows={[
            { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'destructive' | 'link'", default: "'primary'", description: 'Visual weight.' },
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Height and padding: 28 / 32 / 36 / 44px.' },
            { name: 'icon', type: 'boolean', default: 'false', description: 'Square icon-only button. Needs aria-label.' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Spinner, aria-busy, clicks ignored, focus and width kept.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element with button styles.' },
            { name: '...props', type: 'ButtonHTMLAttributes', description: 'Forwarded to <button>, including ref, type, disabled, onClick.' },
          ]}
        />
        <P>
          Need the classes on something else? <Code>buttonClassName({'{ variant, size }'})</Code> returns them. In plain HTML: <Code>ui-btn ui-btn-outline ui-btn-sm</Code>.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable rows={[['Enter', 'Activates the button.'], ['Space', 'Activates the button.']]} />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Renders a native <button>, so role, focus and keyboard come for free.',
            'Loading uses aria-busy + aria-disabled instead of disabled, keeping focus in place.',
            'Keyboard focus shows a 3px ring; pointer focus does not.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Press scales to .97 on the snappy spring (icon buttons .94). Buttons that open a popup answer with colour only.',
            'Hover tints apply only on devices with a fine pointer, so taps never leave a stuck hover.',
            'Reduced motion: no press scale; colours still change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
