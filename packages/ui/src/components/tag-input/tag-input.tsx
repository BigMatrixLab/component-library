'use client';

import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useComposedRefs } from '../../lib/compose-refs';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Badge } from '../badge/badge';
import { BadgeRemove } from '../badge/badge-remove';
import { useFieldControl } from '../field/field-context';
import type { InputSize } from '../input/input';
import { FloatingContent } from '../popover/floating-content';
import { DEFAULT_DELIMITERS, addTags, sameTag, splitTags, type TagRejectReason } from './tag-utils';

export interface TagInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'role' | 'name'
  > {
  /** Controlled tags. */
  value?: string[];
  /** Initial tags when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Most tags allowed. Further ones are rejected. */
  maxTags?: number;
  /** Return true to accept a tag; false or a message string to reject it. */
  validate?: (tag: string, tags: string[]) => boolean | string | void;
  /** Called when a tag is refused: a duplicate, over the limit, or failing `validate`. */
  onTagRejected?: (tag: string, reason: TagRejectReason, message?: string) => void;
  /** Suggestions shown in a list under the field while typing (or on ArrowDown). */
  suggestions?: string[];
  /** Characters that end a tag when typed, besides Enter and Tab. Default `[","]`. */
  delimiters?: string[];
  /** Allow the same tag twice. Default false. */
  allowDuplicates?: boolean;
  /** Treat "Design" and "design" as different tags. Default false. */
  caseSensitive?: boolean;
  /** Turn the text left in the field into a tag when it loses focus. Default true. */
  addOnBlur?: boolean;
  /** Name for the hidden input that submits the tags joined by `separator`. */
  name?: string;
  /** Joins the tags in the hidden input. Default ",". */
  separator?: string;
  /** Height: 32 / 36 / 44px minimum. Default `md`. */
  size?: InputSize;
  /** Accessible name of a chip's × button. Default "Remove {tag}". */
  removeLabel?: (tag: string) => string;
  /** Class for the surrounding box. `className` goes on the text input. */
  groupClassName?: string;
}

const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'];

/**
 * TagInput — a field that turns text into chips. Enter, Tab or a comma adds, a paste is split
 * on commas and new lines, Backspace on empty text highlights and then removes the last chip.
 * Inside a <Field> it picks up the id, aria-describedby, aria-invalid, required and disabled state.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    maxTags,
    validate,
    onTagRejected,
    suggestions,
    delimiters = DEFAULT_DELIMITERS,
    allowDuplicates = false,
    caseSensitive = false,
    addOnBlur = true,
    name,
    separator = ',',
    size = 'md',
    removeLabel = (tag) => `Remove ${tag}`,
    groupClassName,
    className,
    id,
    required,
    disabled,
    readOnly,
    placeholder,
    onKeyDown,
    onPaste,
    onBlur,
    ...props
  },
  ref,
) {
  const control = useFieldControl({
    id,
    required,
    disabled,
    'aria-describedby': props['aria-describedby'],
    'aria-invalid': props['aria-invalid'],
  });
  const [tags, setTags] = useControllableState<string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const [text, setText] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);
  const tagsRef = useRef(tags);
  tagsRef.current = tags;
  const listId = useId();

  const isDisabled = !!control.disabled;
  const locked = isDisabled || !!readOnly;
  const hasSuggestions = !!suggestions && suggestions.length > 0;

  const filtered = useMemo(() => {
    if (!suggestions) return [];
    const q = text.trim().toLowerCase();
    return suggestions
      .filter((s) => allowDuplicates || !tags.some((t) => sameTag(t, s, caseSensitive)))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [suggestions, text, tags, allowDuplicates, caseSensitive]);

  const open = hasSuggestions && menuOpen && filtered.length > 0 && !locked;
  const activeIndex = open && active < filtered.length ? active : -1;

  /** Restart the shake on the chip that already holds this tag. */
  const shake = (tag: string) => {
    const chips = rootRef.current?.querySelectorAll<HTMLElement>('[data-tag-value]');
    const chip = Array.from(chips ?? []).find((el) => sameTag(el.dataset.tagValue ?? '', tag, caseSensitive));
    if (!chip) return;
    chip.removeAttribute('data-shake');
    void chip.offsetWidth;
    chip.setAttribute('data-shake', '');
    window.setTimeout(() => chip.removeAttribute('data-shake'), 450);
  };

  const commit = (candidates: string[]) => {
    const result = addTags(tagsRef.current, candidates, { maxTags, allowDuplicates, caseSensitive, validate });
    if (result.added.length) {
      tagsRef.current = result.tags;
      setTags(result.tags);
    }
    for (const r of result.rejected) {
      if (r.reason === 'duplicate') shake(r.tag);
      onTagRejected?.(r.tag, r.reason, r.message);
    }
    const first = result.rejected[0];
    if (first) {
      setStatus(
        first.reason === 'duplicate'
          ? `${first.tag} is already added`
          : first.reason === 'max'
            ? `Limit of ${maxTags} tags reached`
            : (first.message ?? `${first.tag} is not valid`),
      );
    } else if (result.added.length) {
      setStatus(`Added ${result.added.join(', ')}`);
    }
    return result;
  };

  const removeAt = (index: number) => {
    const tag = tagsRef.current[index];
    if (tag === undefined || locked) return;
    const next = tagsRef.current.filter((_, i) => i !== index);
    tagsRef.current = next;
    setTags(next);
    setStatus(`Removed ${tag}`);
    // Safari and Firefox don't focus a button on click; keep typing where it was
    inputRef.current?.focus();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setActive(-1);
  };

  const pick = (suggestion: string) => {
    commit([suggestion]);
    setText('');
    closeMenu();
    inputRef.current?.focus();
  };

  /** Enter / Tab: take the highlighted suggestion or the typed text. Returns true when it handled the key. */
  const acceptCurrent = (): boolean => {
    if (activeIndex >= 0) {
      pick(filtered[activeIndex]);
      return true;
    }
    if (!text.trim()) return false;
    const result = commit([text]);
    if (result.added.length) setText('');
    closeMenu();
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setHighlight(false);
    if (delimiters.some((d) => d && next.includes(d))) {
      // A delimiter typed (or inserted by a mobile keyboard): everything before it becomes a tag
      let normalized = next;
      for (const d of delimiters) if (d) normalized = normalized.split(d).join('\n');
      const parts = normalized.split('\n');
      const rest = parts.pop() ?? '';
      commit(parts);
      setText(rest.trimStart());
    } else {
      setText(next);
    }
    if (hasSuggestions) {
      setMenuOpen(true);
      setActive(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || locked) return;
    if (highlight && e.key !== 'Backspace' && !MODIFIER_KEYS.includes(e.key)) setHighlight(false);
    if (e.nativeEvent.isComposing) return;

    switch (e.key) {
      case 'Enter':
        if (acceptCurrent()) e.preventDefault();
        break;
      case 'Tab':
        if (!e.shiftKey && acceptCurrent()) e.preventDefault();
        break;
      case 'Backspace': {
        const count = tagsRef.current.length;
        if (text !== '' || count === 0) break;
        e.preventDefault();
        if (highlight) {
          removeAt(count - 1);
          setHighlight(false);
        } else {
          setHighlight(true);
        }
        break;
      }
      case 'ArrowDown':
        if (!hasSuggestions) break;
        e.preventDefault();
        if (!open) {
          setMenuOpen(true);
          setActive(0);
        } else {
          setActive((activeIndex + 1) % filtered.length);
        }
        break;
      case 'ArrowUp':
        if (!open) break;
        e.preventDefault();
        setActive(activeIndex <= 0 ? filtered.length - 1 : activeIndex - 1);
        break;
      case 'Escape':
        if (!open) break;
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        break;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented || locked) return;
    const pasted = e.clipboardData.getData('text');
    if (!/[\r\n]/.test(pasted) && !delimiters.some((d) => d && pasted.includes(d))) return;
    e.preventDefault();
    commit(splitTags(pasted, delimiters));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    setHighlight(false);
    closeMenu();
    if (addOnBlur && !locked && text.trim()) {
      const result = commit([text]);
      if (result.added.length) setText('');
    }
  };

  const handleRootClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isDisabled || (e.target as HTMLElement).closest('button')) return;
    inputRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={cn('ui-tag-input', size !== 'md' && `ui-tag-input-${size}`, groupClassName)}
      data-disabled={isDisabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      onClick={handleRootClick}
    >
      {tags.map((tag, i) => (
        <Badge
          key={allowDuplicates ? `${tag}-${i}` : tag}
          variant="secondary"
          size={size}
          className="ui-tag"
          data-tag-value={tag}
          data-highlighted={highlight && i === tags.length - 1 ? '' : undefined}
        >
          <span className="ui-tag-label">{tag}</span>
          {!readOnly && (
            <BadgeRemove aria-label={removeLabel(tag)} tabIndex={-1} disabled={isDisabled} onClick={() => removeAt(i)} />
          )}
        </Badge>
      ))}
      <input
        ref={composedRef}
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn('ui-tag-input-field', className)}
        value={text}
        readOnly={readOnly}
        placeholder={tags.length === 0 ? placeholder : undefined}
        {...(hasSuggestions
          ? {
              role: 'combobox',
              'aria-autocomplete': 'list' as const,
              'aria-haspopup': 'listbox' as const,
              'aria-expanded': open,
              'aria-controls': open ? listId : undefined,
              'aria-activedescendant': activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined,
            }
          : {})}
        {...props}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        {...control}
      />
      {hasSuggestions && (
        <FloatingContent
          open={open}
          anchorRef={rootRef}
          placement="bottom-start"
          matchWidth
          offset={4}
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="ui-tag-listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map((suggestion, i) => (
            <div
              key={suggestion}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              data-highlighted={i === activeIndex ? '' : undefined}
              className="ui-tag-option"
              onPointerMove={() => setActive(i)}
              onClick={() => pick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </FloatingContent>
      )}
      {name && <input type="hidden" name={name} value={tags.join(separator)} disabled={isDisabled} />}
      <span role="status" aria-live="polite" className="ui-tag-input-status">
        {status}
      </span>
    </div>
  );
});
