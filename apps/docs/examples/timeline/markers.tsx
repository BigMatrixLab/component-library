import { Avatar, AvatarFallback, Icon, Timeline, TimelineDescription, TimelineHeader, TimelineItem, TimelineTime, TimelineTitle } from 'ui-kit';

export default function TimelineMarkers() {
  return (
    <Timeline className="w-full max-w-md" aria-label="Order history">
      <TimelineItem tone="success" marker={<Icon name="circle-check" />}>
        <TimelineHeader>
          <TimelineTitle>Delivered</TimelineTitle>
          <TimelineTime dateTime="2026-11-24T11:20">24 Nov, 11:20</TimelineTime>
        </TimelineHeader>
        <TimelineDescription>Left with the concierge at 14 Harbour Row.</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="info" marker={<Icon name="globe" />}>
        <TimelineHeader>
          <TimelineTitle>Out for delivery</TimelineTitle>
          <TimelineTime dateTime="2026-11-24T08:05">24 Nov, 08:05</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem
        marker={
          <Avatar size="xs">
            <AvatarFallback>LK</AvatarFallback>
          </Avatar>
        }
        markerType="avatar"
      >
        <TimelineHeader>
          <TimelineTitle>Packed by Lena Kowalski</TimelineTitle>
          <TimelineTime dateTime="2026-11-23T16:45">23 Nov, 16:45</TimelineTime>
        </TimelineHeader>
      </TimelineItem>
      <TimelineItem>
        <TimelineHeader>
          <TimelineTitle>Order placed</TimelineTitle>
          <TimelineTime dateTime="2026-11-23T09:12">23 Nov, 09:12</TimelineTime>
        </TimelineHeader>
        <TimelineDescription>3 items, $128.40 charged to Visa ending 4242.</TimelineDescription>
      </TimelineItem>
    </Timeline>
  );
}
