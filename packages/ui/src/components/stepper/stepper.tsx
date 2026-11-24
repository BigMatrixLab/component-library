'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useRovingFocus } from '../../hooks/use-roving-focus';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepState = 'complete' | 'current' | 'upcoming';

interface StepperContextValue {
  value: number;
  setValue: (value: number) => void;
  orientation: StepperOrientation;
  clickable: boolean;
}

interface StepItemContextValue {
  step: number;
  state: StepState;
  disabled: boolean;
}

const StepperContext = createContext<StepperContextValue | null>(null);
const StepItemContext = createContext<StepItemContextValue | null>(null);

function useStepper(component: string) {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Stepper>.`);
  return ctx;
}

function useStepItem(component: string) {
  const ctx = useContext(StepItemContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <StepperItem>.`);
  return ctx;
}

export interface StepperProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'defaultValue' | 'onChange'> {
  /** The current step, 1-based. Steps before it are complete. */
  value?: number;
  /** Initial step when uncontrolled. Default 1. */
  defaultValue?: number;
  /** Called when a step is chosen (steps are only clickable when this is set or `clickable` is true). */
  onValueChange?: (value: number) => void;
  /** Layout direction. Default `horizontal`. */
  orientation?: StepperOrientation;
  /** Make the steps buttons. Defaults to true when `onValueChange` is given. */
  clickable?: boolean;
}

/**
 * Stepper — progress through a multi-step flow. Steps before `value` are
 * complete, `value` is the current step, the rest are upcoming. When the steps
 * are clickable they are real buttons with arrow-key movement between them.
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    value: valueProp,
    defaultValue = 1,
    onValueChange,
    orientation = 'horizontal',
    clickable,
    className,
    onKeyDown,
    children,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const isClickable = clickable ?? onValueChange !== undefined;
  const rove = useRovingFocus({
    itemSelector: 'button.ui-stepper-trigger',
    orientation,
    typeahead: false,
  });
  const ctx = useMemo(
    () => ({ value, setValue, orientation, clickable: isClickable }),
    [value, setValue, orientation, isClickable],
  );
  return (
    <StepperContext.Provider value={ctx}>
      <ol
        ref={ref}
        data-orientation={orientation}
        className={cn('ui-stepper', className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && isClickable) rove(e);
        }}
        {...props}
      >
        {children}
      </ol>
    </StepperContext.Provider>
  );
});

export interface StepperItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** This step's number, 1-based. */
  step: number;
  /** Override the state worked out from the stepper's value (e.g. mark an error or a skipped step). */
  state?: StepState;
  /** Not selectable (only matters when steps are clickable). */
  disabled?: boolean;
}

export const StepperItem = forwardRef<HTMLLIElement, StepperItemProps>(function StepperItem(
  { step, state: stateProp, disabled = false, className, children, ...props },
  ref,
) {
  const stepper = useStepper('StepperItem');
  const state: StepState = stateProp ?? (step < stepper.value ? 'complete' : step === stepper.value ? 'current' : 'upcoming');
  const ctx = useMemo(() => ({ step, state, disabled }), [step, state, disabled]);
  return (
    <StepItemContext.Provider value={ctx}>
      <li
        ref={ref}
        data-state={state}
        data-orientation={stepper.orientation}
        className={cn('ui-stepper-item', className)}
        {...props}
      >
        {children}
      </li>
    </StepItemContext.Provider>
  );
});

/**
 * The part of a step you can press: indicator and text. A `<button>` when the
 * stepper is clickable, otherwise a plain `<div>`. Marks the current step with `aria-current="step"`.
 */
export const StepperTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function StepperTrigger(
  { className, onClick, children, ...props },
  ref,
) {
  const stepper = useStepper('StepperTrigger');
  const item = useStepItem('StepperTrigger');
  const current = item.state === 'current' ? 'step' : undefined;
  if (!stepper.clickable) {
    return (
      <div
        ref={ref as never}
        className={cn('ui-stepper-trigger', className)}
        aria-current={current}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      disabled={item.disabled}
      aria-current={current}
      className={cn('ui-stepper-trigger', className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) stepper.setValue(item.step);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export interface StepperIndicatorProps extends HTMLAttributes<HTMLSpanElement> {}

/** The circle: the step number, turning into a check (drawn in) when the step is complete. */
export const StepperIndicator = forwardRef<HTMLSpanElement, StepperIndicatorProps>(function StepperIndicator(
  { className, children, ...props },
  ref,
) {
  const item = useStepItem('StepperIndicator');
  return (
    <span ref={ref} aria-hidden="true" data-state={item.state} className={cn('ui-stepper-indicator', className)} {...props}>
      {item.state === 'complete' ? (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
          className="ui-stepper-check"
        >
          <path d="M5 12.5l4.5 4.5L19 7" pathLength={1} />
        </svg>
      ) : (
        (children ?? item.step)
      )}
    </span>
  );
});

/** Groups the title and description next to the indicator. */
export const StepperContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StepperContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('ui-stepper-text', className)} {...props} />;
});

export const StepperTitle = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function StepperTitle(
  { className, children, ...props },
  ref,
) {
  const item = useStepItem('StepperTitle');
  return (
    <span ref={ref} className={cn('ui-stepper-title', className)} {...props}>
      {children}
      {item.state === 'complete' && <span className="sr-only"> (completed)</span>}
    </span>
  );
});

export const StepperDescription = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function StepperDescription(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn('ui-stepper-description', className)} {...props} />;
});

/** The line to the next step. It fills (on the smooth spring) once this step is complete. */
export const StepperSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StepperSeparator(
  { className, ...props },
  ref,
) {
  const item = useStepItem('StepperSeparator');
  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      data-state={item.state === 'complete' ? 'complete' : 'incomplete'}
      className={cn('ui-stepper-separator', className)}
      {...props}
    />
  );
});
