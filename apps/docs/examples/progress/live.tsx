'use client';

import { useEffect, useState } from 'react';
import { Button, Progress, ProgressCircle } from 'ui-kit';

export default function ProgressLive() {
  const [value, setValue] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setValue((v) => Math.min(100, (v ?? 0) + 8 + Math.random() * 14));
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (value !== null && value >= 100) setRunning(false);
  }, [value]);

  const start = () => {
    setValue(0);
    setRunning(true);
  };

  const status = value === null ? 'Ready to upload' : value >= 100 ? 'Upload complete' : 'Uploading atlas-assets.zip';

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center gap-4">
        <ProgressCircle aria-label="Upload progress" size="sm" value={value} />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium" aria-live="polite">
            {status}
          </p>
          <Progress aria-label="Upload progress" size="sm" value={value} tone={value === 100 ? 'success' : 'default'} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={start} disabled={running}>
          {value === 100 ? 'Upload again' : 'Start upload'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setRunning(false); setValue(null); }}>
          Show indeterminate
        </Button>
      </div>
    </div>
  );
}
