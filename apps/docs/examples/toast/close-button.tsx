'use client';

import { Button, Toaster, toast } from 'ui-kit';

export default function ToastCloseButton() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => toast.info('Your trial ends Friday', { toasterId: 'close', description: 'Upgrade any time from Billing.', duration: Infinity })}
      >
        Show with a close button
      </Button>
      <Button
        variant="outline"
        onClick={() => toast('Pinned announcement', { toasterId: 'close', duration: Infinity, dismissible: false, description: 'This one cannot be dismissed by hand.' })}
      >
        Not dismissible
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Clear
      </Button>
      <Toaster id="close" closeButton position="top-right" />
    </div>
  );
}
