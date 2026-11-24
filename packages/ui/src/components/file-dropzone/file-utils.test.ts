import { describeAccept, fileKey, formatBytes, matchesAccept, validateFiles } from './file-utils';

const file = (name: string, size = 100, type = '') => ({ name, size, type, lastModified: 1 }) as File;

describe('file-dropzone helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(840)).toBe('840 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2 MB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
    expect(formatBytes(120 * 1024)).toBe('120 KB');
  });

  it('matches extensions, wildcards and exact types', () => {
    expect(matchesAccept(file('a.PDF'), '.pdf')).toBe(true);
    expect(matchesAccept(file('a.png', 1, 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('a.zip', 1, 'application/zip'), 'image/*,application/zip')).toBe(true);
    expect(matchesAccept(file('a.exe', 1, 'application/x-msdownload'), 'image/*,.pdf')).toBe(false);
    expect(matchesAccept(file('a.exe'), undefined)).toBe(true);
  });

  it('describes the accept list for people', () => {
    expect(describeAccept('image/*')).toBe('Images');
    expect(describeAccept('.pdf,.docx,.xlsx')).toBe('PDF, DOCX or XLSX');
    expect(describeAccept('image/png,image/jpeg')).toBe('PNG or JPEG');
    expect(describeAccept('')).toBe('');
  });

  it('rejects the wrong type and too-large files', () => {
    const r = validateFiles([file('a.exe'), file('big.pdf', 5000), file('ok.pdf', 10)], [], {
      accept: '.pdf',
      maxSize: 1000,
      multiple: true,
    });
    expect(r.added.map((f) => f.name)).toEqual(['ok.pdf']);
    expect(r.rejected.map((x) => x.code)).toEqual(['invalid-type', 'too-large']);
  });

  it('caps the list at maxFiles and reports the overflow once', () => {
    const r = validateFiles([file('c.pdf'), file('d.pdf'), file('e.pdf')], [file('a.pdf'), file('b.pdf')], {
      multiple: true,
      maxFiles: 3,
    });
    expect(r.next.map((f) => f.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0]!.code).toBe('too-many');
  });

  it('skips files already in the list', () => {
    const a = file('a.pdf');
    const r = validateFiles([a], [a], { multiple: true });
    expect(r.added).toEqual([]);
    expect(r.rejected).toEqual([]);
    expect(fileKey(a)).toBe('a.pdf:100:1');
  });

  it('replaces the file in single mode, and keeps it when the new pick is invalid', () => {
    const old = file('old.png', 10, 'image/png');
    expect(validateFiles([file('new.png', 10, 'image/png')], [old], { accept: 'image/*' }).next.map((f) => f.name)).toEqual(['new.png']);
    expect(validateFiles([file('x.pdf', 10, 'application/pdf')], [old], { accept: 'image/*' }).next).toEqual([old]);
  });
});
