'use client';

import { Rating } from 'ui-kit';

const reviews = [
  { name: 'Aurora desk lamp', score: 4.3, count: 218 },
  { name: 'Fjord wool throw', score: 4.8, count: 1042 },
  { name: 'Slate ceramic mug', score: 3.6, count: 87 },
];

export default function RatingReadOnly() {
  return (
    <ul className="flex w-full max-w-sm flex-col divide-y divide-border">
      {reviews.map((r) => (
        <li key={r.name} className="flex items-center justify-between gap-4 py-3">
          <span className="text-sm font-medium">{r.name}</span>
          <span className="flex items-center gap-2">
            <Rating readOnly size="sm" value={r.score} aria-label={r.name} />
            <span className="text-xs tabular-nums text-muted-foreground">
              {r.score} ({r.count})
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
