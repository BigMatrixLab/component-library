'use client';

import { Icon, ToggleGroup, ToggleGroupItem } from 'ui-kit';

export default function ToggleIcons() {
  return (
    <ToggleGroup type="single" variant="outline" defaultValue="system" aria-label="Theme">
      <ToggleGroupItem value="light" icon aria-label="Light">
        <Icon name="sun" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" icon aria-label="Dark">
        <Icon name="moon" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" icon aria-label="System">
        <Icon name="monitor" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
