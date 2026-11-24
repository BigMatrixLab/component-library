'use client';

import { useState } from 'react';
import { Icon, Toggle } from 'ui-kit';

export default function ToggleBasic() {
  const [muted, setMuted] = useState(false);

  return (
    <>
      <Toggle aria-label="Favourite" icon>
        <Icon name="star" />
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        <Icon name="bell" />
        Notifications
      </Toggle>
      <Toggle variant="outline" pressed={muted} onPressedChange={setMuted}>
        {muted ? 'Muted' : 'Mute thread'}
      </Toggle>
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
      <Toggle disabled variant="outline">
        Disabled
      </Toggle>
    </>
  );
}
