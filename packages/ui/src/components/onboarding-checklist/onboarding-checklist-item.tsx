'use client';

import type { OnboardingChecklistStep } from './onboarding-checklist';

interface OnboardingChecklistItemProps {
  baseId: string;
  step: OnboardingChecklistStep;
  done: boolean;
  /** The first step that is not done (gets a soft highlight). */
  current: boolean;
  checkable: boolean;
  completedLabel: string;
  onToggle: (id: string, checked: boolean) => void;
}

/** Ids must stay valid for aria-labelledby whatever the step id looks like. */
const slug = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '_');

/**
 * One step row: a round check (a native checkbox when checkable), the title
 * and description, and the step's action while it is not done. Internal.
 */
export function OnboardingChecklistItem({
  baseId,
  step,
  done,
  current,
  checkable,
  completedLabel,
  onToggle,
}: OnboardingChecklistItemProps) {
  const titleId = `${baseId}-step-${slug(step.id)}`;
  const descId = `${titleId}-desc`;
  const inputId = `${titleId}-input`;
  const hasDescription = step.description != null && step.description !== false;

  const indicator = (
    <span className="ui-onboarding-checklist-indicator" aria-hidden="true">
      <svg viewBox="0 0 16 16" focusable="false">
        <path d="M4 8.5l2.5 2.5L12 5.5" pathLength={1} />
      </svg>
    </span>
  );

  return (
    <li
      className="ui-onboarding-checklist-step"
      data-state={done ? 'complete' : 'incomplete'}
      data-current={current ? '' : undefined}
      data-disabled={step.disabled ? '' : undefined}
    >
      <span className="ui-onboarding-checklist-check">
        {checkable ? (
          <input
            type="checkbox"
            id={inputId}
            className="ui-onboarding-checklist-input"
            checked={done}
            disabled={step.disabled}
            aria-labelledby={titleId}
            aria-describedby={hasDescription ? descId : undefined}
            onChange={(e) => onToggle(step.id, e.currentTarget.checked)}
          />
        ) : null}
        {indicator}
      </span>

      <div className="ui-onboarding-checklist-step-body">
        {checkable ? (
          // The title is the checkbox's <label>, so clicking it toggles the step too
          <label id={titleId} htmlFor={inputId} className="ui-onboarding-checklist-step-title">
            {step.title}
          </label>
        ) : (
          <span id={titleId} className="ui-onboarding-checklist-step-title">
            {step.title}
            {done && <span className="ui-onboarding-checklist-sr"> ({completedLabel})</span>}
          </span>
        )}
        {hasDescription && (
          <span id={descId} className="ui-onboarding-checklist-step-description">
            {step.description}
          </span>
        )}
      </div>

      {!done && step.action != null && <div className="ui-onboarding-checklist-step-action">{step.action}</div>}
    </li>
  );
}
