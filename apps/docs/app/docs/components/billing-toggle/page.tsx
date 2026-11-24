import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import BillingToggleBasic from '@/examples/billing-toggle/basic';
import BillingTogglePlans from '@/examples/billing-toggle/plans';
import BillingToggleLocale from '@/examples/billing-toggle/locale';

export const metadata: Metadata = { title: 'Billing toggle' };

export default function BillingTogglePage() {
  return (
    <DocPage href="/docs/components/billing-toggle">
      <Section id="basic" title="Monthly or yearly">
        <P>
          A two-option segmented control with a savings badge on the yearly option. Switch it and the price rolls digit by digit to its new value while the highlight glides across.
        </P>
        <Example component="billing-toggle" file="billing-toggle/basic" title="Billing toggle">
          <BillingToggleBasic />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'Pricing pages and upgrade dialogs where the same plans are sold monthly and yearly.',
            'Any price that changes with a choice the user just made: seats, region, billing period.',
          ]}
        />
        <P>
          Not for: more than two periods (use a <Code>SegmentedControl</Code> with your own items), or a setting that takes effect immediately on an account (use a switch with a confirmation).
        </P>
      </Section>

      <Section id="plans" title="Pricing table">
        <P>
          One toggle drives every card. Each <Code>BillingPrice</Code> sets <Code>announce={'{false}'}</Code> so screen readers don’t hear three prices at once; the selected option is announced by the toggle itself.
        </P>
        <Example component="billing-toggle" file="billing-toggle/plans" title="Pricing table" align="stretch">
          <BillingTogglePlans />
        </Example>
      </Section>

      <Section id="locale" title="Labels, currency and locale">
        <P>
          Labels and the badge are any content. Prices are formatted with <Code>Intl.NumberFormat</Code>, so currency symbols, separators and decimals follow the locale. Whole amounts show no decimals; anything else shows two.
        </P>
        <Example component="billing-toggle" file="billing-toggle/locale" title="German pricing in euros">
          <BillingToggleLocale />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="BillingToggle"
          rows={[
            { name: 'value / defaultValue', type: "'monthly' | 'yearly'", default: "— / 'monthly'", description: 'Controlled or initial billing cycle.' },
            { name: 'onValueChange', type: '(value: BillingCycle) => void', description: 'Called when the cycle changes.' },
            { name: 'savings', type: 'ReactNode', description: 'Badge in the yearly option, e.g. “Save 20%”. Part of its accessible name.' },
            { name: 'monthlyLabel / yearlyLabel', type: 'ReactNode', default: "'Monthly' / 'Yearly'", description: 'Option labels.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height: 32 / 38 / 46px (taller on touch screens).' },
            { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to the container.' },
            { name: 'name', type: 'string', description: 'Submits the cycle with a form.' },
            { name: 'aria-label', type: 'string', default: "'Billing period'", description: 'Accessible name of the radio group.' },
          ]}
        />
        <PropsTable
          title="BillingPrice"
          rows={[
            { name: 'amount', type: 'number', description: 'The price. Changing it rolls the digits.' },
            { name: 'currency', type: 'string', default: "'USD'", description: 'ISO 4217 code.' },
            { name: 'locale', type: 'string', default: "'en-US'", description: 'Fixed by default so server and client render the same.' },
            { name: 'format', type: 'Intl.NumberFormatOptions', description: 'Merged over the currency defaults.' },
            { name: 'period', type: 'ReactNode', description: 'Muted text after the amount, e.g. “/ month”.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Amount size: 24 / 34 / 40px.' },
            { name: 'announce', type: 'boolean', default: 'true', description: 'Polite live region for the new price.' },
          ]}
        />
        <P>
          Need the rolling digits alone? <Code>BillingPrice</Code> is built on <Code>AnimatedNumber</Code> from the animated counter.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['Tab', 'Moves focus to the selected option (one tab stop).'],
            ['← → ↑ ↓', 'Moves to the other option and selects it.'],
            ['Home / End', 'Selects Monthly / Yearly.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'A radiogroup named “Billing period” with two radios; the savings badge is read with the yearly option (“Yearly Save 20%”).',
            'BillingPrice exposes one plain text node (“$24”) inside a polite, atomic live region; the rolling cells are hidden from assistive tech.',
            'The badge uses the success tint with the success text colour, measured at 4.5:1 or more in light and dark.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'The highlight pill glides on the morph spring; it does not animate on first render.',
            'Each changed digit rolls on the morph spring; digits that appear (9 → 10) rise in.',
            'Pressing the yearly option nudges the badge to .96 on the snappy spring.',
            'Reduced motion: the selection and the price change instantly.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
