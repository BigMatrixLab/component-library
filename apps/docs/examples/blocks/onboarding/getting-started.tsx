'use client';

import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Icon,
  OnboardingChecklist,
  Progress,
  type IconName,
} from 'ui-kit';

const QUICK_LINKS: { title: string; description: string; icon: IconName }[] = [
  { title: 'Documentation', description: 'Guides for frameworks, builds and domains.', icon: 'file' },
  { title: 'Templates', description: 'Next.js, Astro and Remix starters.', icon: 'layout-dashboard' },
  { title: 'API keys', description: 'Tokens for the CLI and your CI.', icon: 'lock' },
  { title: 'Community', description: 'Ask questions and share what you built.', icon: 'users' },
];

export default function OnboardingGettingStarted() {
  const [done, setDone] = useState<string[]>(['workspace']);
  const [checklistHidden, setChecklistHidden] = useState(false);

  const finish = (...ids: string[]) => setDone((d) => [...d, ...ids.filter((id) => !d.includes(id))]);
  const deployed = done.includes('deploy');

  const action = (label: string, ...ids: string[]) => (
    <Button size="xs" variant="outline" onClick={() => finish(...ids)}>
      {label}
    </Button>
  );

  return (
    <section className="@container rounded-2xl border border-border bg-background px-4 py-8 @2xl:px-8 @2xl:py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <Card className="grid gap-6 p-5 @2xl:p-8 @3xl:grid-cols-[minmax(0,1fr)_16rem] @3xl:items-end">
          <div className="grid min-w-0 gap-3">
            <p className="text-sm font-medium text-primary-text">Pro trial · 12 days left</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight @2xl:text-3xl">Welcome to Halcyon, Amina</h2>
            <p className="max-w-prose text-md text-muted-foreground">
              Northwind Labs is set up. Finish the steps below to ship your first deploy, or take the tour to see how
              previews, rollbacks and on-call fit together.
            </p>
            <div className="mt-2 flex flex-col gap-2.5 @md:flex-row">
              <Button>
                <Icon name="sparkles" />
                Take the 2-minute tour
              </Button>
              <Button variant="outline" asChild>
                <a href="#">Read the docs</a>
              </Button>
            </div>
          </div>
          <div className="grid gap-2 rounded-lg border border-border bg-background p-4">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">Trial</span>
              <span className="tabular-nums text-muted-foreground">2 of 14 days</span>
            </div>
            <Progress
              value={2}
              max={14}
              size="sm"
              aria-label="Trial used"
              getValueText={(v, m) => `${v} of ${m} trial days used`}
            />
            <p className="text-xs text-muted-foreground">Ends December 7. No card on file yet.</p>
          </div>
        </Card>

        <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] @3xl:items-start">
          <div className="grid min-w-0 gap-6">
            {checklistHidden ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <p className="flex items-center gap-2 text-sm">
                  <Icon name="circle-check" className="text-success-text" />
                  Setup finished. Nice work.
                </p>
                <Button size="sm" variant="ghost" onClick={() => setChecklistHidden(false)}>
                  Show checklist
                </Button>
              </div>
            ) : (
              <OnboardingChecklist
                headingLevel={2}
                title="Get ready to ship"
                description="Five steps, about ten minutes."
                completeTitle="You are ready to ship"
                completeDescription="Every step is done. Your next push deploys on its own."
                value={done}
                onValueChange={setDone}
                onDismiss={() => setChecklistHidden(true)}
                steps={[
                  { id: 'workspace', title: 'Create your workspace', description: 'Northwind Labs lives at halcyon.app/northwind.' },
                  {
                    id: 'invite',
                    title: 'Invite your team',
                    description: 'Reviewers get a preview link on every pull request.',
                    action: action('Invite', 'invite'),
                  },
                  {
                    id: 'repo',
                    title: 'Connect a Git repository',
                    description: 'GitHub, GitLab or Bitbucket.',
                    action: action('Connect', 'repo'),
                  },
                  {
                    id: 'deploy',
                    title: 'Deploy your first project',
                    description: 'Start from a template or your own repository.',
                    action: action('Deploy', 'deploy'),
                  },
                  {
                    id: 'domain',
                    title: 'Add a custom domain',
                    description: 'Point northwind.dev at your production deploy.',
                    action: action('Add domain', 'domain'),
                  },
                ]}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle as="h2">Deployments</CardTitle>
                <CardDescription>Production and preview deploys for every project.</CardDescription>
                <CardAction>
                  <Badge variant="secondary">{deployed ? '1 total' : '0 total'}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                {deployed ? (
                  <ul className="ui-animate-rise grid gap-2" aria-label="Recent deployments">
                    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border p-3 text-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted">
                        <Icon name="globe" />
                      </span>
                      <span className="grid min-w-0 flex-1">
                        <span className="truncate font-medium">northwind-web</span>
                        <span className="truncate text-muted-foreground">main · 4f2a91c · Initial commit</span>
                      </span>
                      <Badge variant="success" size="sm">
                        Ready
                      </Badge>
                      <span className="text-muted-foreground">Just now</span>
                    </li>
                  </ul>
                ) : (
                  <Empty variant="dashed">
                    <EmptyHeader>
                      <EmptyMedia>
                        <Icon name="zap" />
                      </EmptyMedia>
                      <EmptyTitle as="h3">No deployments yet</EmptyTitle>
                      <EmptyDescription>
                        Deploy a starter template to see previews and one-click rollbacks in action.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyActions>
                      <Button size="sm" onClick={() => finish('deploy')}>
                        Deploy a template
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => finish('repo', 'deploy')}>
                        Import a repository
                      </Button>
                    </EmptyActions>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6">
            <Card>
              <CardHeader>
                <CardTitle as="h2">Quick links</CardTitle>
              </CardHeader>
              <CardContent>
                <nav aria-label="Quick links">
                  <ul className="-mx-2 grid gap-1">
                    {QUICK_LINKS.map((link) => (
                      <QuickLink key={link.title} {...link} />
                    ))}
                  </ul>
                </nav>
              </CardContent>
            </Card>

            <Card variant="muted" className="grid gap-3 p-5">
              <h2 className="text-md font-semibold">Want a hand getting set up?</h2>
              <p className="text-sm text-muted-foreground">
                Book a free 20-minute call with a release engineer. We will walk through your first pipeline together.
              </p>
              <div>
                <Button size="sm" variant="outline">
                  <Icon name="calendar" />
                  Book a call
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLink({ title, description, icon }: { title: string; description: ReactNode; icon: IconName }) {
  return (
    <li>
      <a
        href="#"
        className="flex items-start gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/45"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background">
          <Icon name={icon} />
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </span>
        <Icon name="arrow-up-right" className="mt-1 shrink-0 text-muted-foreground" />
      </a>
    </li>
  );
}
