import { Avatar, AvatarFallback, Button, HoverCard, HoverCardContent, HoverCardTrigger, Icon, getInitials } from 'ui-kit';

export default function HoverCardUser() {
  return (
    <p className="max-w-sm text-base">
      Release notes for 2.4 were written by{' '}
      <HoverCard>
        <HoverCardTrigger
          href="#ada-lovelace"
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          @adalovelace
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="ui-hover-card-header">
            <Avatar size="lg">
              <AvatarFallback>{getInitials('Ada Lovelace')}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="ui-hover-card-title">Ada Lovelace</p>
              <p className="ui-hover-card-meta">@adalovelace</p>
            </div>
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
          <p className="ui-hover-card-text">
            Engineering lead for the platform team. Writes about compilers, release engineering and calm
            interfaces.
          </p>
          <p className="ui-hover-card-meta mt-3 flex items-center gap-1.5">
            <Icon name="calendar" />
            Joined 12 March 2021 · 1,284 followers
          </p>
        </HoverCardContent>
      </HoverCard>{' '}
      and reviewed by the design systems group.
    </p>
  );
}
