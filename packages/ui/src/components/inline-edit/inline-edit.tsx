'use client';

import { forwardRef, useEffect, useId, useRef, useState, type ChangeEvent, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';
import { CheckGlyph, SpinnerGlyph } from '../../lib/glyphs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon } from '../../icons/icon';

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'defaultValue' | 'onChange' | 'onSubmit'> {
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value once it is saved. */
  onValueChange?: (value: string) => void;
  /**
   * Persist the new value. Return a promise to show a pending state; throw (or
   * reject) with an Error to keep the field open and show its message.
   */
  onSave?: (next: string) => unknown | Promise<unknown>;
  /** Return an error message to block saving. Runs before `onSave`. */
  validate?: (next: string) => string | null | undefined;
  /** Accessible name of the field, e.g. "Project name". */
  label?: string;
  /** Shown when the value is empty. */
  placeholder?: string;
  /** Allow saving an empty value. Default false. */
  allowEmpty?: boolean;
  /** Message when empty is not allowed. Default "Can’t be empty". */
  emptyMessage?: string;
  /** Blur saves (true, default) or cancels (false). */
  saveOnBlur?: boolean;
  /** Select all text when editing starts. Default true. */
  selectOnEdit?: boolean;
  maxLength?: number;
  disabled?: boolean;
  /** Called when editing starts or ends. */
  onEditingChange?: (editing: boolean) => void;
  /** Class for the input while editing. */
  inputClassName?: string;
}

/**
 * InlineEdit — text that becomes an input without moving. The input shares the
 * text's font metrics, and its padding and border are cancelled by a negative
 * margin, so the words stay where they were. Enter or blur saves, Esc cancels.
 */
export const InlineEdit = forwardRef<HTMLSpanElement, InlineEditProps>(function InlineEdit(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onSave,
    validate,
    label = 'Value',
    placeholder = 'Add a value',
    allowEmpty = false,
    emptyMessage = 'Can’t be empty',
    saveOnBlur = true,
    selectOnEdit = true,
    maxLength,
    disabled,
    onEditingChange,
    inputClassName,
    className,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState<string>({ value: valueProp, defaultValue, onChange: onValueChange });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayRef = useRef<HTMLButtonElement | null>(null);
  const finished = useRef(false);
  const pendingRef = useRef(false);
  const refocus = useRef(false);
  const mounted = useRef(true);
  const savedTimer = useRef(0);
  const onEditingChangeRef = useRef(onEditingChange);
  onEditingChangeRef.current = onEditingChange;
  const errorId = useId();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(savedTimer.current);
    };
  }, []);

  useEffect(() => {
    onEditingChangeRef.current?.(editing);
    if (editing) {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      if (selectOnEdit) input.select();
    } else if (refocus.current) {
      refocus.current = false;
      displayRef.current?.focus();
    }
  }, [editing, selectOnEdit]);

  const begin = () => {
    if (disabled) return;
    setDraft(value);
    setError(null);
    finished.current = false;
    setEditing(true);
  };

  const finish = (restoreFocus: boolean) => {
    finished.current = true;
    refocus.current = restoreFocus;
    setError(null);
    setEditing(false);
  };

  const flashSaved = () => {
    setSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 1400);
  };

  const commit = async (fromBlur: boolean) => {
    if (finished.current || pendingRef.current) return;
    const next = draft.trim();
    if (next === value) {
      finish(!fromBlur);
      return;
    }
    const problem = !next && !allowEmpty ? emptyMessage : validate?.(next);
    if (problem) {
      setError(problem);
      if (!fromBlur) inputRef.current?.focus();
      return;
    }
    if (!onSave) {
      setValue(next);
      flashSaved();
      finish(!fromBlur);
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await onSave(next);
      if (!mounted.current) return;
      setValue(next);
      flashSaved();
      finish(!fromBlur);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error && err.message ? err.message : 'Couldn’t save. Try again.');
      if (!fromBlur) inputRef.current?.focus();
    } finally {
      pendingRef.current = false;
      if (mounted.current) setPending(false);
    }
  };

  const cancel = (restoreFocus: boolean) => {
    if (pendingRef.current) return;
    finish(restoreFocus);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void commit(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel(true);
    }
  };

  const handleBlur = () => {
    if (finished.current || pendingRef.current) return;
    if (saveOnBlur) void commit(true);
    else cancel(false);
  };

  const shown = (editing ? draft : value) || placeholder;

  return (
    <span
      {...props}
      ref={ref}
      className={cn('ui-inline-edit', className)}
      data-state={editing ? 'edit' : 'view'}
      data-pending={pending || undefined}
      data-invalid={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="ui-inline-edit-sizer" aria-hidden="true">
        {shown}
        {'​'}
      </span>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className={cn('ui-inline-edit-input', inputClassName)}
          value={draft}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={pending}
          spellCheck={false}
          autoComplete="off"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-busy={pending || undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <button
          ref={displayRef}
          type="button"
          className="ui-inline-edit-display"
          disabled={disabled}
          aria-label={`Edit ${label.toLowerCase()}: ${value || 'empty'}`}
          onClick={begin}
        >
          {value || <span className="ui-inline-edit-placeholder">{placeholder}</span>}
        </button>
      )}
      <span className="ui-inline-edit-affix" aria-hidden="true">
        {pending ? (
          <SpinnerGlyph />
        ) : saved && !editing ? (
          <CheckGlyph className="ui-inline-edit-ok" width={14} height={14} />
        ) : (
          !editing && <Icon name="pencil" size={14} className="ui-inline-edit-hint" />
        )}
      </span>
      {error && (
        <span id={errorId} role="alert" className="ui-inline-edit-error">
          {error}
        </span>
      )}
      <span className="ui-inline-edit-live" role="status" aria-live="polite">
        {saved ? 'Saved' : null}
      </span>
    </span>
  );
});
