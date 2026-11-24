'use client';

import { InlineEdit } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function InlineEditRenameProject() {
  return (
    <div className="w-full max-w-md">
      <h3 className="text-2xl font-semibold tracking-tight">
        <InlineEdit
          defaultValue="Q4 launch plan"
          label="Project name"
          maxLength={40}
          validate={(name) => (name.length < 3 ? 'Use at least 3 characters' : null)}
          onSave={async (name) => {
            await wait(700);
            if (name.toLowerCase() === 'untitled') throw new Error('That name is reserved');
          }}
        />
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">Click the name, type, then press Enter. Esc cancels.</p>
    </div>
  );
}
