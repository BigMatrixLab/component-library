import { Skeleton } from 'ui-kit';

export default function SkeletonShapes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6" aria-busy="true">
      <span role="status" className="sr-only">
        Loading
      </span>
      <div className="space-y-2">
        <Skeleton width="85%" />
        <Skeleton width="60%" />
        <Skeleton width="72%" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton shape="circle" width={48} />
        <Skeleton shape="circle" width={32} />
        <Skeleton shape="circle" width={24} />
      </div>
      <Skeleton shape="block" height={96} />
    </div>
  );
}
