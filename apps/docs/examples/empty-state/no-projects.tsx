import { Button, Empty, EmptyActions, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Icon } from 'ui-kit';

export default function EmptyNoProjects() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Icon name="folder" />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Projects keep your files, members and deploys in one place. Create your first one to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyActions>
        <Button>
          <Icon name="plus" />
          New project
        </Button>
        <Button variant="outline">Import from GitHub</Button>
      </EmptyActions>
    </Empty>
  );
}
