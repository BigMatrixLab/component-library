export type FileRejectionCode = 'invalid-type' | 'too-large' | 'too-many';

export interface FileRejection {
  /** The file that was refused. For `too-many` it is the first file over the limit. */
  file: File;
  code: FileRejectionCode;
  /** Ready to show: names the file and the rule it broke. */
  message: string;
}

export interface ValidateOptions {
  /** Same syntax as <input accept>: ".pdf,image/*,application/zip". */
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  /** More than one file at a time. Default false: a new pick replaces the old file. */
  multiple?: boolean;
}

/** Stable identity of a picked file. */
export function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/** 0 B, 840 B, 1.5 KB, 12 MB, 1.2 GB. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const text = i === 0 || value >= 100 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, '');
  return `${text} ${units[i]}`;
}

function acceptTokens(accept: string | undefined): string[] {
  return (accept ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Does `file` match an <input accept> string? No `accept` means everything does. */
export function matchesAccept(file: Pick<File, 'name' | 'type'>, accept?: string): boolean {
  const tokens = acceptTokens(accept);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** "image/*, .pdf, application/zip" becomes "Images, PDF or ZIP". */
export function describeAccept(accept?: string): string {
  const labels = acceptTokens(accept).map((token) => {
    if (token.startsWith('.')) return token.slice(1).toUpperCase();
    if (token === 'image/*') return 'Images';
    if (token === 'video/*') return 'Videos';
    if (token === 'audio/*') return 'Audio files';
    if (token === 'text/*') return 'Text files';
    const subtype = token.split('/')[1] ?? token;
    return subtype.split('+')[0]!.split('.').pop()!.toUpperCase();
  });
  const unique = Array.from(new Set(labels));
  if (unique.length <= 1) return unique[0] ?? '';
  return `${unique.slice(0, -1).join(', ')} or ${unique[unique.length - 1]}`;
}

/**
 * Check a pick against the rules. Returns the new list, what was added and one rejection per
 * broken rule (overflow past `maxFiles` is reported once). In single mode the new file replaces
 * the old one; if nothing valid was picked the old one stays. Files already in the list are skipped.
 */
export function validateFiles(
  incoming: File[],
  current: File[],
  { accept, maxSize, maxFiles, multiple = false }: ValidateOptions = {},
): { next: File[]; added: File[]; rejected: FileRejection[] } {
  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  const list = multiple ? current.slice() : [];
  const added: File[] = [];
  const rejected: FileRejection[] = [];
  const overflow: File[] = [];

  for (const file of incoming) {
    if (multiple && list.some((f) => fileKey(f) === fileKey(file))) continue;
    if (!matchesAccept(file, accept)) {
      const allowed = describeAccept(accept);
      rejected.push({
        file,
        code: 'invalid-type',
        message: `${file.name} isn't an accepted file type${allowed ? `. Use ${allowed}.` : '.'}`,
      });
      continue;
    }
    if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({
        file,
        code: 'too-large',
        message: `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(maxSize)}.`,
      });
      continue;
    }
    if (list.length >= limit) {
      overflow.push(file);
      continue;
    }
    list.push(file);
    added.push(file);
  }

  if (overflow.length) {
    const rule = !multiple ? 'Only one file is allowed.' : `The limit is ${limit} ${limit === 1 ? 'file' : 'files'}.`;
    rejected.push({
      file: overflow[0]!,
      code: 'too-many',
      message: overflow.length === 1 ? `${overflow[0]!.name} was not added. ${rule}` : `${overflow.length} files were not added. ${rule}`,
    });
  }

  return { next: !multiple && !added.length ? current.slice() : list, added, rejected };
}
