'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { badgeClassName } from '../badge/badge';
import { SegmentedControl, SegmentedControlItem, type SegmentedControlProps } from '../toggle-group/segmented-control';

export type BillingCycle = 'monthly' | 'yearly';

export interface BillingToggleProps
  extends Omit<SegmentedControlProps, 'value' | 'defaultValue' | 'onValueChange' | 'children'> {
  /** Controlled billing cycle. */
  value?: BillingCycle;
  /** Initial cycle when uncontrolled. Default `monthly`. */
  defaultValue?: BillingCycle;
  onValueChange?: (value: BillingCycle) => void;
  /** Label of the monthly option. Default "Monthly". */
  monthlyLabel?: ReactNode;
  /** Label of the yearly option. Default "Yearly". */
  yearlyLabel?: ReactNode;
  /** Badge inside the yearly option, e.g. "Save 20%". Omit for none. Part of the option's accessible name. */
  savings?: ReactNode;
}

/**
 * BillingToggle — a two-option segmented control for monthly ↔ yearly pricing, with an optional
 * savings badge on the yearly option. The highlight pill glides on the morph spring; arrow keys
 * move and select (radiogroup). Pair it with <BillingPrice> so prices roll to their new value.
 */
export const BillingToggle = forwardRef<HTMLDivElement, BillingToggleProps>(function BillingToggle(
  {
    value,
    defaultValue = 'monthly',
    onValueChange,
    monthlyLabel = 'Monthly',
    yearlyLabel = 'Yearly',
    savings,
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const hasSavings = savings !== undefined && savings !== null && savings !== false && savings !== '';
  return (
    <SegmentedControl
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange as ((value: string) => void) | undefined}
      aria-label={ariaLabel ?? (props['aria-labelledby'] ? undefined : 'Billing period')}
      className={cn('ui-billing-toggle', className)}
      {...props}
    >
      <SegmentedControlItem value="monthly" className="ui-billing-toggle-item">
        {monthlyLabel}
      </SegmentedControlItem>
      <SegmentedControlItem value="yearly" className="ui-billing-toggle-item">
        {yearlyLabel}
        {/* A real space, so the accessible name reads "Yearly Save 20%" (collapsed visually by flex) */}
        {hasSavings && ' '}
        {hasSavings && (
          <span className={badgeClassName({ variant: 'success', size: 'sm', className: 'ui-billing-toggle-save' })}>
            {savings}
          </span>
        )}
      </SegmentedControlItem>
    </SegmentedControl>
  );
});
