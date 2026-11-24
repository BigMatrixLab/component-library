'use client';

import { useEffect, useRef, useState } from 'react';
import { Field, FileDropzone, Label, fileKey } from 'ui-kit';

/** Fakes an upload: progress climbs every 250ms until the file is "uploaded". */
export default function FileDropzoneDocuments() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const timers = useRef(new Map<string, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const keys = new Set(files.map(fileKey));
    for (const [key, timer] of timers.current) {
      if (!keys.has(key)) {
        clearInterval(timer);
        timers.current.delete(key);
      }
    }
    for (const file of files) {
      const key = fileKey(file);
      if (timers.current.has(key)) continue;
      let value = 0;
      const speed = 6 + (file.size % 7);
      const timer = setInterval(() => {
        value = Math.min(100, value + speed);
        setProgress((p) => ({ ...p, [key]: value }));
        if (value >= 100) clearInterval(timer);
      }, 250);
      timers.current.set(key, timer);
    }
  }, [files]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearInterval(timer));
    },
    [],
  );

  return (
    <div className="w-full max-w-lg">
      <Field>
        <Label>Contracts and invoices</Label>
        <FileDropzone
          multiple
          accept=".pdf,.docx,.xlsx"
          maxSize={10 * 1024 * 1024}
          maxFiles={5}
          value={files}
          onFilesChange={setFiles}
          fileStatus={(file) => {
            const value = progress[fileKey(file)] ?? 0;
            return value >= 100 ? { status: 'success' } : { status: 'uploading', progress: value };
          }}
        />
      </Field>
    </div>
  );
}
