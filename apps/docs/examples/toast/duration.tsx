'use client';

import { Button, toast } from 'ui-kit';

export default function ToastDuration() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast('Link copied', { duration: 1500 })}>
        1.5 seconds
      </Button>
      <Button variant="outline" onClick={() => toast('Backup finished', { description: 'Hover to pause the timer.', duration: 10000 })}>
        10 seconds
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('You are offline', {
            id: 'connection',
            description: 'Changes will sync when the connection returns.',
            duration: Infinity,
          })
        }
      >
        Until dismissed
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss('connection')}>
        Dismiss it
      </Button>
    </div>
  );
}
