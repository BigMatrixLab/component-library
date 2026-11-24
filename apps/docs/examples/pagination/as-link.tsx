import Link from 'next/link';
import {
  Icon,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from 'ui-kit';

const page: number = 2;
const total: number = 5;
const href = (n: number) => `/docs/components/pagination?page=${n}`;

export default function PaginationAsLink() {
  return (
    <Pagination aria-label="Blog pages">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious asChild disabled={page === 1}>
            <Link href={href(page - 1)}>
              <Icon name="chevron-left" />
              Previous
            </Link>
          </PaginationPrevious>
        </PaginationItem>
        {getPaginationRange({ page, total }).map((p) =>
          typeof p === 'number' ? (
            <PaginationItem key={p}>
              <PaginationLink asChild isActive={p === page}>
                <Link href={href(p)}>{p}</Link>
              </PaginationLink>
            </PaginationItem>
          ) : null,
        )}
        <PaginationItem>
          <PaginationNext asChild disabled={page === total}>
            <Link href={href(page + 1)}>
              Next
              <Icon name="chevron-right" />
            </Link>
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
