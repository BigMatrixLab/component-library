'use client';

import { useRef, type ReactNode } from 'react';
import { usePresence } from '../../hooks/use-presence';
import { Button } from '../button';

export interface DataTableBulkBarProps {
  count: number;
  onClear: () => void;
  children?: ReactNode;
}

/**
 * Floating bar that rises in when rows are selected and sinks out when the
 * selection is cleared. It docks to the bottom of the viewport while the table is in view.
 */
export function DataTableBulkBar({ count, onClear, children }: DataTableBulkBarProps) {
  const present = count > 0;
  const { mounted, state, ref } = usePresence<HTMLDivElement>(present);
  // Keep the last content while the exit animation runs
  const last = useRef({ count, children });
  if (present) last.current = { count, children };
  if (!mounted) return null;
  return (
    <div className="ui-data-table-bulk-dock">
      <div ref={ref} role="region" aria-label="Bulk actions" data-state={state} className="ui-data-table-bulk">
        <span className="ui-data-table-bulk-count">{last.current.count} selected</span>
        <span className="ui-data-table-bulk-actions">{last.current.children}</span>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={!present}>
          Clear
        </Button>
      </div>
    </div>
  );
}
