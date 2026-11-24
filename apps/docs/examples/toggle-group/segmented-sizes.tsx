'use client';

import { Icon, SegmentedControl, SegmentedControlItem } from 'ui-kit';

export default function SegmentedSizes() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <SegmentedControl size="sm" defaultValue="week" aria-label="Range (small)">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultValue="board" aria-label="View">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="timeline" disabled>
          Timeline
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl size="lg" fullWidth defaultValue="calendar" aria-label="Layout (full width)">
        <SegmentedControlItem value="calendar">
          <Icon name="calendar" />
          Calendar
        </SegmentedControlItem>
        <SegmentedControlItem value="activity">
          <Icon name="activity" />
          Activity
        </SegmentedControlItem>
        <SegmentedControlItem value="files">
          <Icon name="folder" />
          Files
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
