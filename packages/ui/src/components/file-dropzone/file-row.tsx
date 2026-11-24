'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../icons/icon';
import { Progress } from '../progress/progress';
import { formatBytes } from './file-utils';
import type { FileStatusInfo } from './types';

/** An object URL for `file` that is revoked when the file changes or the row unmounts. */
function useObjectUrl(file: File, enabled: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file, enabled]);
  return url;
}

export interface FileRowProps {
  file: File;
  info?: FileStatusInfo;
  /** Show an image thumbnail for image files. */
  previews: boolean;
  /** Extra content under the file name (a retry button, a link). */
  extra?: ReactNode;
  removeLabel: string;
  disabled?: boolean;
  onRemove: () => void;
}

/** One picked file: thumbnail or type icon, name, size, status, optional progress, remove button. */
export function FileRow({ file, info, previews, extra, removeLabel, disabled, onRemove }: FileRowProps) {
  const isImage = file.type.startsWith('image/');
  const url = useObjectUrl(file, previews && isImage);
  const status = info?.status ?? 'idle';
  const pct = info?.progress === undefined ? undefined : Math.min(100, Math.max(0, Math.round(info.progress)));
  const size = formatBytes(file.size);

  const meta =
    status === 'uploading'
      ? `${size} · ${pct === undefined ? 'Uploading…' : `${pct}%`}`
      : status === 'success'
        ? `${size} · Uploaded`
        : status === 'error'
          ? (info?.message ?? 'Upload failed')
          : size;

  return (
    <li className="ui-file-row" data-status={status}>
      <span className="ui-file-row-thumb" aria-hidden="true">
        {url ? <img src={url} alt="" draggable={false} /> : <Icon name={isImage ? 'image' : 'file'} size={18} />}
      </span>
      <span className="ui-file-row-body">
        <span className="ui-file-row-name" title={file.name}>
          {file.name}
        </span>
        <span className="ui-file-row-meta" data-tone={status === 'error' ? 'error' : undefined}>
          {meta}
        </span>
        {status === 'uploading' && (
          <Progress
            size="sm"
            value={pct ?? null}
            aria-label={`Uploading ${file.name}`}
            getValueText={(v) => `${Math.round(v)}% uploaded`}
          />
        )}
        {extra}
      </span>
      {status === 'success' && <Icon name="circle-check" size={18} className="ui-file-row-status" data-tone="success" />}
      {status === 'error' && <Icon name="circle-alert" size={18} className="ui-file-row-status" data-tone="error" />}
      <button type="button" className="ui-file-row-remove" aria-label={removeLabel} disabled={disabled} onClick={onRemove}>
        <Icon name="x" size={16} />
      </button>
    </li>
  );
}
