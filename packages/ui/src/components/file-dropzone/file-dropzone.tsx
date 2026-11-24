'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Icon, type IconName } from '../../icons/icon';
import { useFieldControl } from '../field/field-context';
import { FileRow } from './file-row';
import { describeAccept, formatBytes, validateFiles, fileKey, type FileRejection } from './file-utils';
import type { FileStatusInfo } from './types';

export interface FileDropzoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'title'> {
  /** Controlled list of files. */
  value?: File[];
  /** Initial files when uncontrolled. */
  defaultValue?: File[];
  /** Called with the full list whenever a file is added or removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with the files that were refused (wrong type, too big, over the limit). */
  onReject?: (rejections: FileRejection[]) => void;
  /** Same syntax as <input accept>: ".pdf,.docx" or "image/*". */
  accept?: string;
  /** Allow several files. Default false: a new pick replaces the old file. */
  multiple?: boolean;
  /** Largest file, in bytes. */
  maxSize?: number;
  /** Most files in the list (with `multiple`). */
  maxFiles?: number;
  disabled?: boolean;
  /** Name for the real file input, so the files submit with a surrounding form. */
  name?: string;
  /** The line in the drop target. Default "Click to upload or drag and drop". */
  title?: ReactNode;
  /** The rules under the title. Default: built from `accept`, `maxSize` and `maxFiles`. `null` hides it. */
  rules?: ReactNode;
  /** Icon in the drop target. Default `upload`. */
  icon?: IconName;
  /** `compact` is a single row, for avatars and small forms. Default `default`. */
  variant?: 'default' | 'compact';
  /** Replace the whole content of the drop target. */
  children?: ReactNode;
  /** Show the list of picked files under the target. Default true. */
  showList?: boolean;
  /** Image thumbnails in the list. Default true. */
  previews?: boolean;
  /** Per-file upload state: a progress bar, "Uploaded" or an error message. */
  fileStatus?: (file: File) => FileStatusInfo | undefined;
  /** Extra content under a file's name, e.g. a retry button. */
  renderFileExtra?: (file: File) => ReactNode;
  /** Accessible name of a row's remove button. Default "Remove {name}". */
  removeLabel?: (file: File) => string;
  /** Class for the drop target itself. `className` goes on the outer wrapper. */
  zoneClassName?: string;
}

function hasFiles(e: DragEvent) {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

function autoRules(accept: string | undefined, maxSize: number | undefined, maxFiles: number | undefined, multiple: boolean) {
  const parts: string[] = [];
  const types = describeAccept(accept);
  if (types) parts.push(types);
  if (maxSize !== undefined) parts.push(multiple ? `up to ${formatBytes(maxSize)} each` : `up to ${formatBytes(maxSize)}`);
  if (multiple && maxFiles !== undefined) parts.push(`max ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}`);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * FileDropzone — a drop target with a real <input type="file"> behind it, validation
 * (type, size, count) with clear error rows, and a list of picked files with thumbnails,
 * progress and remove buttons. It never uploads: use `onFilesChange` and feed progress back
 * through `fileStatus`. Inside a <Field> it picks up the id, aria-describedby and disabled state.
 */
export const FileDropzone = forwardRef<HTMLDivElement, FileDropzoneProps>(function FileDropzone(
  {
    value: valueProp,
    defaultValue,
    onFilesChange,
    onReject,
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    disabled,
    name,
    title,
    rules: rulesProp,
    icon = 'upload',
    variant = 'default',
    children,
    showList = true,
    previews = true,
    fileStatus,
    renderFileExtra,
    removeLabel = (file) => `Remove ${file.name}`,
    zoneClassName,
    className,
    id,
    ...props
  },
  ref,
) {
  const rules = rulesProp === undefined ? autoRules(accept, maxSize, maxFiles, multiple) : rulesProp;
  const titleId = useId();
  const rulesId = useId();
  const control = useFieldControl(
    { id, disabled, 'aria-describedby': props['aria-describedby'] },
    rules !== null && rules !== false && children === undefined ? rulesId : null,
  );
  const isDisabled = !!control.disabled;

  const [files, setFiles] = useControllableState<File[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onFilesChange,
  });
  const filesRef = useRef(files);
  filesRef.current = files;
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  /** Mirror the list into the real input so a surrounding form submits it. */
  const syncInput = (list: File[]) => {
    const el = inputRef.current;
    if (!el || typeof DataTransfer === 'undefined') return;
    try {
      const transfer = new DataTransfer();
      list.forEach((f) => transfer.items.add(f));
      el.files = transfer.files;
    } catch {
      /* older browsers: the input keeps the last pick */
    }
  };
  useEffect(() => {
    if (name) syncInput(files);
  }, [files, name]);

  const handleFiles = (picked: File[]) => {
    if (isDisabled || !picked.length) return;
    const result = validateFiles(picked, filesRef.current, { accept, maxSize, maxFiles, multiple });
    setRejections(result.rejected);
    if (result.rejected.length) onReject?.(result.rejected);
    if (result.added.length) {
      filesRef.current = result.next;
      setFiles(result.next);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []));
    // Reset so picking the same file again still fires `change`
    if (name) syncInput(filesRef.current);
    else e.target.value = '';
  };

  const openPicker = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    if (!isDisabled) setDragging(true);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = isDisabled ? 'none' : 'copy';
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (file: File) => {
    const next = filesRef.current.filter((f) => f !== file);
    filesRef.current = next;
    setFiles(next);
    setRejections([]);
    // The row with the focused button is about to disappear
    zoneRef.current?.focus();
  };

  return (
    <div ref={ref} className={cn('ui-file-dropzone', className)} {...props} aria-describedby={undefined}>
      <div
        ref={zoneRef}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        className={cn('ui-file-dropzone-zone', variant === 'compact' && 'ui-file-dropzone-compact', zoneClassName)}
        aria-labelledby={children === undefined ? titleId : undefined}
        aria-describedby={control['aria-describedby']}
        aria-disabled={isDisabled || undefined}
        data-dragging={dragging ? '' : undefined}
        data-disabled={isDisabled ? '' : undefined}
        data-invalid={control['aria-invalid'] ? '' : undefined}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {children ?? (
          <>
            <span className="ui-file-dropzone-icon" aria-hidden="true">
              <Icon name={icon} size={20} />
            </span>
            <span className="ui-file-dropzone-text">
              <span id={titleId} className="ui-file-dropzone-title">
                {title ?? (
                  <>
                    <span className="ui-file-dropzone-link">Click to upload</span> or drag and drop
                  </>
                )}
              </span>
              {rules !== null && rules !== false && (
                <span id={rulesId} className="ui-file-dropzone-rules">
                  {rules}
                </span>
              )}
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        id={control.id}
        type="file"
        className="ui-file-dropzone-input"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept}
        multiple={multiple}
        name={name}
        disabled={isDisabled}
        onChange={handleInput}
      />

      {rejections.length > 0 && (
        <ul role="alert" className="ui-file-errors">
          {rejections.map((r, i) => (
            <li key={`${fileKey(r.file)}-${r.code}-${i}`} className="ui-file-error">
              <Icon name="circle-alert" size={16} />
              <span className="ui-file-error-text">{r.message}</span>
              <button
                type="button"
                className="ui-file-row-remove"
                aria-label="Dismiss error"
                onClick={() => setRejections((list) => list.filter((x) => x !== r))}
              >
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showList && files.length > 0 && (
        <ul className="ui-file-list" aria-label="Selected files">
          {files.map((file) => (
            <FileRow
              key={fileKey(file)}
              file={file}
              info={fileStatus?.(file)}
              previews={previews}
              extra={renderFileExtra?.(file)}
              removeLabel={removeLabel(file)}
              disabled={isDisabled}
              onRemove={() => remove(file)}
            />
          ))}
        </ul>
      )}
    </div>
  );
});
