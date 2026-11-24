'use client';

import { Button, Toaster, toast } from 'ui-kit';

export default function ToastRichColors() {
  const show = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: ['Workspace created', 'Atlas is ready for your team.'],
      error: ['Deploy failed', 'Build step “compile” exited with code 1.'],
      warning: ['Trial ends in 3 days', 'Add a payment method to keep your projects.'],
      info: ['New version available', 'Reload to get v2.4 with faster search.'],
    } as const;
    toast[type](messages[type][0], { toasterId: 'rich', description: messages[type][1] });
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => show('success')}>Success</Button>
      <Button variant="outline" onClick={() => show('error')}>Error</Button>
      <Button variant="outline" onClick={() => show('warning')}>Warning</Button>
      <Button variant="outline" onClick={() => show('info')}>Info</Button>
      <Toaster id="rich" richColors />
    </div>
  );
}
