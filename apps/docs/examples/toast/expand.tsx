'use client';

import { Button, Toaster, toast } from 'ui-kit';

let count = 0;

export default function ToastExpand() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => {
          count += 1;
          toast(`New comment #${count}`, { toasterId: 'expand', description: 'Jonas replied in “Launch checklist”.', duration: 10000 });
        }}
      >
        Add a toast
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
      <Toaster id="expand" expand visibleToasts={4} position="bottom-center" />
    </div>
  );
}
