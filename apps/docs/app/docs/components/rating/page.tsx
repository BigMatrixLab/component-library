import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import RatingBasic from '@/examples/rating/basic';
import RatingHalf from '@/examples/rating/half';
import RatingReadOnly from '@/examples/rating/read-only';
import RatingForm from '@/examples/rating/form';

export const metadata: Metadata = { title: 'Rating' };

export default function RatingPage() {
  return (
    <DocPage href="/docs/components/rating">
      <Section id="basic" title="Basic">
        <P>Hover to preview, click to choose. The chosen star pops slightly. Underneath are native radio inputs, so it works in forms and with the arrow keys.</P>
        <Example component="rating" file="rating/basic" title="Basic rating">
          <RatingBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A quick opinion on a product, stay, article or support chat.',
            'Showing an average score next to a review count (read-only).',
            'Not for precise measurements (use a slider) or when you need written feedback (add a textarea).',
          ]}
        />
      </Section>

      <Section id="half" title="Half steps">
        <P><Code>allowHalf</Code> splits every star into two halves: the left half picks .5. Values step by 0.5.</P>
        <Example component="rating" file="rating/half" title="Half steps">
          <RatingHalf />
        </Example>
      </Section>

      <Section id="read-only" title="Read-only">
        <P><Code>readOnly</Code> turns the stars into an image with a text alternative and shows fractional values: 4.3 fills 30% of the fifth star.</P>
        <Example component="rating" file="rating/read-only" title="Read-only" align="stretch">
          <RatingReadOnly />
        </Example>
      </Section>

      <Section id="form" title="In a form">
        <P>Give it a <Code>name</Code>: the checked radio submits its value with the form. <Code>required</Code> works natively.</P>
        <Example component="rating" file="rating/form" title="Rating in a form">
          <RatingForm />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Rating"
          rows={[
            { name: 'value / defaultValue', type: 'number', default: '0', description: 'Current rating. 0 means none.' },
            { name: 'onValueChange', type: '(value: number) => void', description: 'Called when the rating changes.' },
            { name: 'max', type: 'number', default: '5', description: 'Number of stars.' },
            { name: 'allowHalf', type: 'boolean', description: 'Half-star steps.' },
            { name: 'allowClear', type: 'boolean', description: 'Clicking the chosen star again, or Backspace/Delete, clears it.' },
            { name: 'readOnly', type: 'boolean', description: 'Display only; supports fractional values.' },
            { name: 'disabled', type: 'boolean', description: 'Not interactive, dimmed.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Star size 16 / 24 / 32px.' },
            { name: 'name / required', type: 'string / boolean', description: 'Form field name and native required.' },
            { name: 'aria-label', type: 'string', default: "'Rating'", description: 'Name of the group.' },
          ]}
        />
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves focus to the rating (the chosen star, else the first).'],
            ['Arrow keys', 'Choose the previous / next value (native radio behaviour; 0.5 steps with allowHalf).'],
            ['Backspace / Delete', 'Clear the rating (when allowClear).'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A radiogroup of native radio inputs, each named “3 stars”, “2.5 stars”.',
            'Read-only ratings are role="img" with a label like “Rating: 4.3 out of 5”.',
            'Stars have an amber fill and a darker amber outline, so they stay visible on light and dark surfaces.',
            'Keyboard focus shows a ring around the star.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Hovering previews the value instantly; the fill tracks in 150ms.',
            'The chosen star pops from .72 to 1 on the snappy spring.',
            'Reduced motion: no pop; fills still change.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
