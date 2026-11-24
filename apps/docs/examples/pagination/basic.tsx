'use client';

import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  usePagination,
} from 'ui-kit';

const total = 12;
const perPage = 10;
const invoices = 117;

export default function PaginationBasic() {
  const [page, setPage] = useState(6);
  const pages = usePagination({ page, total });
  return (
    <div className="grid justify-items-center gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          {pages.map((p) =>
            typeof p === 'number' ? (
              <PaginationItem key={p}>
                <PaginationLink isActive={p === page} aria-label={`Page ${p}`} onClick={() => setPage(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-sm tabular-nums text-muted-foreground">
        Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, invoices)} of {invoices} invoices
      </p>
    </div>
  );
}
