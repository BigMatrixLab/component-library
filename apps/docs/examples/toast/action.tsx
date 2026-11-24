'use client';

import { Button, toast } from 'ui-kit';

export default function ToastAction() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast('Conversation archived', {
            description: 'Moved to Archive. It will not show up in your inbox.',
            duration: 8000,
            action: { label: 'Undo', onClick: () => toast.success('Conversation restored') },
          })
        }
      >
        With an action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('Delete 3 files?', {
            description: 'They will be removed from every shared folder.',
            duration: Infinity,
            cancel: { label: 'Keep' },
            action: { label: 'Delete', onClick: () => toast.success('3 files deleted') },
          })
        }
      >
        Action and cancel
      </Button>
    </div>
  );
}
