import { Avatar, AvatarFallback, Badge, Icon, Timeline, TimelineDescription, TimelineGroup, TimelineHeader, TimelineItem, TimelineTime, TimelineTitle } from 'ui-kit';

export default function TimelineDeploys() {
  return (
    <Timeline className="w-full max-w-lg" aria-label="Deploy activity">
      <TimelineGroup label="Today">
        <TimelineItem tone="success" marker={<Icon name="circle-check" />}>
          <TimelineHeader>
            <TimelineTitle>Deployed to production</TimelineTitle>
            <TimelineTime dateTime="2026-11-24T14:32">2:32 pm</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            <code className="font-mono text-xs">a3f9c21</code> “Fix invoice rounding” went live in 48 s.
          </TimelineDescription>
        </TimelineItem>
        <TimelineItem tone="destructive" marker={<Icon name="circle-x" />}>
          <TimelineHeader>
            <TimelineTitle>Preview build failed</TimelineTitle>
            <TimelineTime dateTime="2026-11-24T13:05">1:05 pm</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Type error in <code className="font-mono text-xs">billing/summary.tsx</code>. Retried automatically.
          </TimelineDescription>
        </TimelineItem>
        <TimelineItem
          marker={
            <Avatar size="xs">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          }
          markerType="avatar"
        >
          <TimelineHeader>
            <TimelineTitle>Amina Rahman requested a review</TimelineTitle>
            <TimelineTime dateTime="2026-11-24T10:18">10:18 am</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>
            Pull request #482{' '}
            <Badge variant="info" size="sm">
              Review
            </Badge>
          </TimelineDescription>
        </TimelineItem>
      </TimelineGroup>
      <TimelineGroup label="Yesterday">
        <TimelineItem tone="warning" marker={<Icon name="triangle-alert" />}>
          <TimelineHeader>
            <TimelineTitle>Rollback to v2.14.3</TimelineTitle>
            <TimelineTime dateTime="2026-11-23T17:40">5:40 pm</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Error rate rose above 2% after v2.14.4, so the release was reverted.</TimelineDescription>
        </TimelineItem>
        <TimelineItem tone="success">
          <TimelineHeader>
            <TimelineTitle>Deployed v2.14.4 to staging</TimelineTitle>
            <TimelineTime dateTime="2026-11-23T15:12">3:12 pm</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
        <TimelineItem>
          <TimelineHeader>
            <TimelineTitle>Environment variable updated</TimelineTitle>
            <TimelineTime dateTime="2026-11-23T09:30">9:30 am</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>STRIPE_WEBHOOK_SECRET was rotated by Tomás Herrera.</TimelineDescription>
        </TimelineItem>
      </TimelineGroup>
    </Timeline>
  );
}
