import { Skeleton } from 'ui-kit';

const WIDTHS = [
  ['60%', '40%', '30%'],
  ['75%', '55%', '25%'],
  ['50%', '45%', '35%'],
  ['68%', '38%', '28%'],
];

export default function SkeletonTable() {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border" aria-busy="true">
      <span role="status" className="sr-only">
        Loading customers
      </span>
      <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-medium">
        <span>Customer</span>
        <span>Plan</span>
        <span>Amount</span>
      </div>
      {WIDTHS.map((row, i) => (
        <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr] items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
          <div className="flex items-center gap-3">
            <Skeleton shape="circle" width={28} />
            <Skeleton width={row[0]} />
          </div>
          <Skeleton width={row[1]} />
          <Skeleton width={row[2]} />
        </div>
      ))}
    </div>
  );
}
