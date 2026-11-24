'use client';

import { Button, toast } from 'ui-kit';

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast('Draft saved')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Invoice #1042 sent', { description: 'Mara Okafor will get it within a minute.' })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Payment declined', { description: 'The card ending 4242 was declined by the bank.' })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Storage is 90% full', { description: 'Free up space or upgrade your plan.' })}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Maintenance on Sunday', { description: 'Scheduled from 02:00 to 03:00 UTC.' })}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.loading('Importing 2,481 contacts…')}>
        Loading
      </Button>
    </div>
  );
}
