'use client';

import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';
import { Collapse } from '../accordion/collapse';
import { Button } from '../button/button';
import { Progress, ProgressCircle } from '../progress/progress';
import { OnboardingChecklistItem } from './onboarding-checklist-item';

export interface OnboardingChecklistStep {
  /** Stable id; completed steps are tracked by id. */
  id: string;
  title: ReactNode;
  /** One line on why or how. */
  description?: ReactNode;
  /** Shown while the step is not done, e.g. a small button or link that starts it. */
  action?: ReactNode;
  disabled?: boolean;
  /** Override the checklist's `checkable` for this step. */
  checkable?: boolean;
}

export interface OnboardingChecklistLabels {
  /** Name of the progress indicator. Default `Setup progress`. */
  progress?: string;
  /** Announced and shown in the bar layout. Default `{done} of {total} steps complete`. */
  count?: (done: number, total: number) => string;
  /** Announced when the last step is ticked. Default `All steps complete`. */
  allComplete?: string;
  /** Screen-reader suffix on a done step that has no checkbox. Default `Completed`. */
  completed?: string;
  /** Dismiss button in the finished state. Default `Dismiss`. */
  dismiss?: string;
}

export interface OnboardingChecklistProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'defaultValue' | 'onChange'> {
  title: ReactNode;
  description?: ReactNode;
  /** The steps, in order. */
  steps: OnboardingChecklistStep[];
  /** Controlled: ids of the completed steps. */
  value?: string[];
  /** Initial completed ids when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new list of completed ids. */
  onValueChange?: (value: string[]) => void;
  /** Called once when the last step is completed (not on mount). */
  onComplete?: () => void;
  /** Steps can be ticked by the user. `false` when the app marks them done. Default true. */
  checkable?: boolean;
  /** The header gets a button that hides the steps. Default true. */
  collapsible?: boolean;
  /** Controlled: steps visible. */
  open?: boolean;
  /** Initial visibility when uncontrolled. Default true. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Progress as a 40px `ring` beside the title or a `bar` under it. Default `ring`. */
  progress?: 'ring' | 'bar';
  /** Title once every step is done. Default: `title`. */
  completeTitle?: ReactNode;
  /** Description once every step is done. Default: `description`. */
  completeDescription?: ReactNode;
  /** Shows a Dismiss button in the finished state. */
  onDismiss?: () => void;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  labels?: OnboardingChecklistLabels;
}

const DEFAULT_LABELS: Required<OnboardingChecklistLabels> = {
  progress: 'Setup progress',
  count: (done, total) => `${done} of ${total} steps complete`,
  allComplete: 'All steps complete',
  completed: 'Completed',
  dismiss: 'Dismiss',
};

/** How long the finish celebration keeps its data attribute (longest animation + margin). */
const CELEBRATE_MS = 1200;

/**
 * OnboardingChecklist — a card of setup steps with a progress ring or bar.
 * Steps tick off with a check that draws itself; the list collapses under the
 * header; finishing the last step celebrates once (ring pop, halo, check).
 * Completed steps are controlled (`value`) or uncontrolled (`defaultValue`).
 */
export const OnboardingChecklist = forwardRef<HTMLElement, OnboardingChecklistProps>(function OnboardingChecklist(
  {
    title,
    description,
    steps,
    value: valueProp,
    defaultValue = [],
    onValueChange,
    onComplete,
    checkable = true,
    collapsible = true,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    progress = 'ring',
    completeTitle,
    completeDescription,
    onDismiss,
    headingLevel = 3,
    labels: labelsProp,
    className,
    ...props
  },
  ref,
) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [value, setValue] = useControllableState<string[]>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  const titleId = `${id}-title`;
  const listId = `${id}-steps`;

  const doneSet = new Set(value);
  const total = steps.length;
  const done = steps.filter((s) => doneSet.has(s.id)).length;
  const complete = total > 0 && done === total;
  const currentId = steps.find((s) => !doneSet.has(s.id) && !s.disabled)?.id;

  // Celebrate only when the checklist *becomes* complete, never on mount
  const [prevComplete, setPrevComplete] = useState(complete);
  const [celebrating, setCelebrating] = useState(false);
  const [announced, setAnnounced] = useState(false);
  if (complete !== prevComplete) {
    setPrevComplete(complete);
    setCelebrating(complete);
    setAnnounced(complete);
  }
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (!celebrating) return;
    onCompleteRef.current?.();
    const t = window.setTimeout(() => setCelebrating(false), CELEBRATE_MS);
    return () => window.clearTimeout(t);
  }, [celebrating]);

  const toggleStep = (stepId: string, checked: boolean) =>
    setValue((prev) => {
      const next = new Set(prev);
      if (checked) next.add(stepId);
      else next.delete(stepId);
      // Keep the steps' order so the value is stable
      return steps.map((s) => s.id).filter((sid) => next.has(sid));
    });

  const Heading = `h${headingLevel}` as 'h3';
  const countText = labels.count(done, total);
  const shownTitle = complete && completeTitle != null ? completeTitle : title;
  const shownDescription = complete && completeDescription != null ? completeDescription : description;

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      data-state={open ? 'open' : 'closed'}
      data-complete={complete ? '' : undefined}
      data-celebrate={celebrating ? '' : undefined}
      data-progress={progress}
      className={cn('ui-onboarding-checklist', className)}
      {...props}
    >
      <div className="ui-onboarding-checklist-header">
        {progress === 'ring' && (
          <span className="ui-onboarding-checklist-ring">
            <ProgressCircle
              size="sm"
              value={done}
              max={Math.max(total, 1)}
              tone={complete ? 'success' : 'default'}
              aria-label={labels.progress}
              getValueText={() => countText}
            >
              {complete ? (
                <svg viewBox="0 0 24 24" className="ui-onboarding-checklist-ring-check" aria-hidden="true" focusable="false">
                  <path d="M6 12.5l4 4L18 8.5" pathLength={1} />
                </svg>
              ) : (
                <span className="ui-onboarding-checklist-ring-count">
                  {done}/{total}
                </span>
              )}
            </ProgressCircle>
          </span>
        )}

        <div className="ui-onboarding-checklist-heading">
          <Heading id={titleId} className="ui-onboarding-checklist-title" key={complete ? 'done' : 'todo'}>
            {shownTitle}
          </Heading>
          {shownDescription != null && <p className="ui-onboarding-checklist-description">{shownDescription}</p>}
        </div>

        {complete && onDismiss && (
          <Button variant="ghost" size="sm" className="ui-onboarding-checklist-dismiss" onClick={onDismiss}>
            {labels.dismiss}
          </Button>
        )}
        {collapsible && (
          <button
            type="button"
            className="ui-onboarding-checklist-toggle"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={titleId}
            onClick={() => setOpen(!open)}
          >
            <Icon name="chevron-down" size={16} className="ui-onboarding-checklist-chevron" />
          </button>
        )}
      </div>

      {progress === 'bar' && (
        <div className="ui-onboarding-checklist-bar">
          <Progress
            size="sm"
            value={done}
            max={Math.max(total, 1)}
            tone={complete ? 'success' : 'default'}
            aria-label={labels.progress}
            getValueText={() => countText}
          />
          <span className="ui-onboarding-checklist-count" aria-hidden="true">
            {done}/{total}
          </span>
        </div>
      )}

      <Collapse
        id={listId}
        open={!collapsible || open}
        onReveal={() => setOpen(true)}
        className="ui-onboarding-checklist-body"
      >
        <ol className="ui-onboarding-checklist-steps">
          {steps.map((step) => (
            <OnboardingChecklistItem
              key={step.id}
              baseId={id}
              step={step}
              done={doneSet.has(step.id)}
              current={step.id === currentId}
              checkable={step.checkable ?? checkable}
              completedLabel={labels.completed}
              onToggle={toggleStep}
            />
          ))}
        </ol>
      </Collapse>

      <span role="status" className="ui-onboarding-checklist-sr">
        {announced ? labels.allComplete : ''}
      </span>
    </section>
  );
});
