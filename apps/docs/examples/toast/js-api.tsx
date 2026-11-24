'use client';

import { Button, toast } from 'ui-kit';

/** `toast()` is a plain function: call it from event handlers, data hooks or non-React code. */
async function saveSettings() {
  const id = toast.loading('Saving settings…');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  // Calling with the same id updates that toast in place
  toast.success('Settings saved', { id, description: 'Applies to all 4 members.' });
}

export default function ToastJsApi() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={saveSettings}>
        Update in place
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
    </div>
  );
}
