import { Button, OnboardingChecklist } from 'ui-kit';

export default function OnboardingChecklistWorkspace() {
  return (
    <div className="w-full max-w-lg">
      <OnboardingChecklist
        title="Set up your workspace"
        description="Five steps to your first deploy."
        completeTitle="Your workspace is ready"
        completeDescription="Everything is set up. Happy shipping."
        defaultValue={['workspace']}
        steps={[
          { id: 'workspace', title: 'Create your workspace', description: 'Name it and pick a region.' },
          {
            id: 'team',
            title: 'Invite your team',
            description: 'Teammates get access to every project.',
            action: <Button size="xs" variant="outline">Invite</Button>,
          },
          { id: 'repo', title: 'Connect a repository', description: 'GitHub, GitLab or Bitbucket.' },
          { id: 'billing', title: 'Add a payment method', description: 'You won’t be charged during the trial.' },
          { id: 'deploy', title: 'Deploy your first project' },
        ]}
      />
    </div>
  );
}
