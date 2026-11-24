'use client';

import { useState } from 'react';
import { Badge, BadgeRemove, Button } from 'ui-kit';

const INITIAL = ['Design', 'Frontend', 'Accessibility', 'Q4 roadmap'];

export default function BadgeRemovable() {
  const [tags, setTags] = useState(INITIAL);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex min-h-7 flex-wrap items-center justify-center gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" size="lg">
            {tag}
            <BadgeRemove aria-label={`Remove ${tag}`} onClick={() => setTags((t) => t.filter((x) => x !== tag))} />
          </Badge>
        ))}
        {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags left.</span>}
      </div>
      {tags.length < INITIAL.length && (
        <Button variant="ghost" size="sm" onClick={() => setTags(INITIAL)}>
          Reset tags
        </Button>
      )}
    </div>
  );
}
