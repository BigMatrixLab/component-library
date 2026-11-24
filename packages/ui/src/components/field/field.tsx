'use client';

import {
  forwardRef,
  useId,
  useState,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import { Icon } from '../../icons/icon';
import { FieldContext, useFieldContext } from './field-context';

export { useFieldControl, useFieldContext } from './field-context';
export type { FieldContextValue, FieldControlProps } from './field-context';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** `vertical` (default) stacks label, control and messages; `horizontal` puts the label beside the control. */
  orientation?: 'vertical' | 'horizontal';
  /** Marks the control invalid (aria-invalid). Rendering a <FieldError> does this automatically. */
  invalid?: boolean;
  /** Marks the control required and shows the marker on the label. */
  required?: boolean;
  /** Disables the control and dims the label. */
  disabled?: boolean;
  /** Id for the control (and the label's `htmlFor`). Generated when omitted. */
  controlId?: string;
}

/**
 * Field — wires a label, one control, a hint and an error together:
 * shared id, aria-describedby, aria-invalid and the required marker.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { orientation = 'vertical', invalid = false, required = false, disabled = false, controlId, className, children, ...props },
  ref,
) {
  const uid = useId();
  const [ownerId, setControlId] = useState<string | null>(null);
  const [hasHint, setHasHint] = useState(false);
  const [hasError, setHasError] = useState(false);
  return (
    <FieldContext.Provider
      value={{
        controlId: ownerId ?? controlId ?? `${uid}-control`,
        hintId: `${uid}-hint`,
        errorId: `${uid}-error`,
        invalid,
        required,
        disabled,
        hasHint,
        hasError,
        setControlId,
        setHasHint,
        setHasError,
      }}
    >
      <div
        ref={ref}
        data-invalid={invalid || hasError || undefined}
        data-disabled={disabled || undefined}
        className={cn('ui-field', orientation === 'horizontal' && 'ui-field-horizontal', className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
});

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows the required marker. Inside a <Field> it follows the field's `required`. */
  required?: boolean;
}

/** Label — a native label. Inside a <Field> it targets the field's control. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, htmlFor, className, children, ...props },
  ref,
) {
  const ctx = useFieldContext();
  const showMarker = required ?? ctx?.required;
  return (
    <label
      ref={ref}
      htmlFor={htmlFor ?? ctx?.controlId}
      data-disabled={ctx?.disabled || undefined}
      data-required={showMarker || undefined}
      className={cn('ui-label', className)}
      {...props}
    >
      {children}
    </label>
  );
});

/** FieldHint — helper text under the control. Referenced by aria-describedby. */
export const FieldHint = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FieldHint(
  { className, id, ...props },
  ref,
) {
  const ctx = useFieldContext();
  const setHasHint = ctx?.setHasHint;
  useIsomorphicLayoutEffect(() => {
    setHasHint?.(true);
    return () => setHasHint?.(false);
  }, [setHasHint]);
  return <p ref={ref} id={id ?? ctx?.hintId} className={cn('ui-field-hint', className)} {...props} />;
});

/**
 * FieldError — the validation message. It rises in, marks the control
 * `aria-invalid` and is announced politely. Renders nothing without children.
 */
export const FieldError = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FieldError(
  { className, id, children, ...props },
  ref,
) {
  const ctx = useFieldContext();
  const setHasError = ctx?.setHasError;
  const present = children !== undefined && children !== null && children !== false && children !== '';
  useIsomorphicLayoutEffect(() => {
    if (!present) return;
    setHasError?.(true);
    return () => setHasError?.(false);
  }, [setHasError, present]);
  if (!present) return null;
  return (
    <p ref={ref} id={id ?? ctx?.errorId} role="alert" className={cn('ui-field-error', className)} {...props}>
      <Icon name="circle-alert" size={14} />
      <span>{children}</span>
    </p>
  );
});

/** Fieldset — groups related fields under a <Legend>. `disabled` disables every control inside. */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetHTMLAttributes<HTMLFieldSetElement>>(function Fieldset(
  { className, ...props },
  ref,
) {
  return <fieldset ref={ref} className={cn('ui-fieldset', className)} {...props} />;
});

/** Legend — the caption of a <Fieldset>. */
export const Legend = forwardRef<HTMLLegendElement, HTMLAttributes<HTMLLegendElement>>(function Legend(
  { className, ...props },
  ref,
) {
  return <legend ref={ref} className={cn('ui-legend', className)} {...props} />;
});

/** Form — a native form that lays its fields out on a grid with consistent gaps. */
export const Form = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(function Form(
  { className, ...props },
  ref,
) {
  return <form ref={ref} className={cn('ui-form', className)} {...props} />;
});
