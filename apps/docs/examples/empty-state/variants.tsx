import { Button, Empty, EmptyActions, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Icon } from 'ui-kit';

export default function EmptyVariants() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Empty variant="dashed">
        <EmptyHeader>
          <EmptyMedia>
            <Icon name="upload" />
          </EmptyMedia>
          <EmptyTitle>Drop files to upload</EmptyTitle>
          <EmptyDescription>PNG, JPG or PDF up to 10 MB each.</EmptyDescription>
        </EmptyHeader>
        <EmptyActions>
          <Button size="sm" variant="outline">
            Browse files
          </Button>
        </EmptyActions>
      </Empty>
      <Empty variant="card">
        <EmptyHeader>
          <EmptyMedia>
            <Icon name="search" />
          </EmptyMedia>
          <EmptyTitle>No results for “invoice 2031”</EmptyTitle>
          <EmptyDescription>Check the spelling or try a broader search, like a client name.</EmptyDescription>
        </EmptyHeader>
        <EmptyActions>
          <Button size="sm" variant="ghost">
            Clear search
          </Button>
        </EmptyActions>
      </Empty>
    </div>
  );
}
