import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AnimatedNumber } from '../animated-counter/animated-counter';

export type BillingPriceSize = 'sm' | 'md' | 'lg';

export interface BillingPriceProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The price to show. Changing it rolls each changed digit to its new value. */
  amount: number;
  /** ISO 4217 currency code. Default `USD`. */
  currency?: string;
  /** BCP 47 locale. Default `en-US` (fixed, so server and client render the same). */
  locale?: string;
  /** Extra Intl.NumberFormat options, merged over the currency defaults. */
  format?: Intl.NumberFormatOptions;
  /** Muted text after the amount, e.g. "/ month". */
  period?: ReactNode;
  /** Amount size: 24 / 34 / 40px. Default `md`. */
  size?: BillingPriceSize;
  /**
   * Announce changes politely to screen readers (`aria-live="polite"`). Default `true`.
   * Turn it off when several prices change at once and one summary is announced elsewhere.
   */
  announce?: boolean;
}

/**
 * BillingPrice — a price whose digits roll to the new value (AnimatedNumber on the morph spring)
 * with a muted period after it. Whole amounts show no decimals; others show two.
 * Screen readers get the plain formatted text, announced politely when it changes.
 */
export const BillingPrice = forwardRef<HTMLSpanElement, BillingPriceProps>(function BillingPrice(
  { amount, currency = 'USD', locale = 'en-US', format, period, size = 'md', announce = true, className, ...props },
  ref,
) {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    ...format,
  };
  return (
    <span
      ref={ref}
      className={cn('ui-billing-price', size !== 'md' && `ui-billing-price-${size}`, className)}
      aria-live={announce ? 'polite' : undefined}
      aria-atomic={announce ? true : undefined}
      {...props}
    >
      <AnimatedNumber className="ui-billing-price-amount" value={amount} format={options} locale={locale} />
      {period !== undefined && period !== null && period !== false && period !== '' && (
        <span className="ui-billing-price-period">{period}</span>
      )}
    </span>
  );
});
