'use client';

import { CopyButton } from 'ui-kit';

export default function CopyButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton value="npm install ui-kit" label="Copy command" />
      <CopyButton value="https://app.example.com/invite/7Hq2-mTz9" label="Copy invite link" variant="secondary" />
      <CopyButton value="INV-3041" aria-label="Copy invoice number" />
      <CopyButton value="INV-3041" aria-label="Copy invoice number" variant="outline" />
      <CopyButton value={() => new Date().toISOString()} label="Copy timestamp" variant="ghost" size="md" />
    </div>
  );
}
