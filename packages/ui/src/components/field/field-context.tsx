'use client';

import { createContext, useContext } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';

export interface FieldContextValue {
  /** The id the control and the label's `htmlFor` share. */
  controlId: string;
  hintId: string;
  errorId: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  hasHint: boolean;
  hasError: boolean;
  /** A control with its own `id` registers it so the label follows. `null` restores the default. */
  setControlId: (id: string | null) => void;
  setHasHint: (v: boolean) => void;
  setHasError: (v: boolean) => void;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** The surrounding <Field>, or null when a control is used standalone. */
export function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  required?: boolean;
  disabled?: boolean;
}

/**
 * Wires a form control to its <Field>: id, aria-describedby (hint + error + the
 * control's own), aria-invalid, required and disabled. Without a Field it passes
 * the control's own props through, so every control works standalone.
 * Use it to make your own control Field-aware.
 *
 * `extraDescribedBy` appends ids the control owns (e.g. a character counter).
 */
export function useFieldControl(props: FieldControlProps, extraDescribedBy?: string | false | null) {
  const ctx = useContext(FieldContext);
  const ownId = props.id;
  const setControlId = ctx?.setControlId;

  useIsomorphicLayoutEffect(() => {
    if (!setControlId || !ownId) return;
    setControlId(ownId);
    return () => setControlId(null);
  }, [setControlId, ownId]);

  const describedBy =
    [props['aria-describedby'], ctx?.hasHint && ctx.hintId, ctx?.hasError && ctx.errorId, extraDescribedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  const invalid = props['aria-invalid'] ?? (ctx && (ctx.invalid || ctx.hasError) ? true : undefined);

  return {
    id: ownId ?? ctx?.controlId,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    required: props.required ?? (ctx?.required || undefined),
    disabled: props.disabled || ctx?.disabled || undefined,
  };
}
