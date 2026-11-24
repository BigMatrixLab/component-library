'use client';

import { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationStatus } from 'ui-kit';

const total = 12;

export default function PaginationCompact() {
  const [page, setPage] = useState(3);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
        </PaginationItem>
        <PaginationItem>
          <PaginationStatus page={page} total={total} className="px-2" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
