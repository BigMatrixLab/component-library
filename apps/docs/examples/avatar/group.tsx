import type { CSSProperties } from 'react';
import { Avatar, AvatarFallback, AvatarGroup, Card, CardContent } from 'ui-kit';

const TEAM = ['AR', 'JW', 'MT', 'CD', 'PN', 'LK', 'SO'];

export default function AvatarGroupExample() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AvatarGroup max={4} aria-label="Project members">
        {TEAM.map((initials) => (
          <Avatar key={initials}>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      {/* On a card, tell the group which colour to ring with */}
      <Card className="w-full max-w-xs">
        <CardContent className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Atlas redesign</span>
          <AvatarGroup size="sm" max={3} style={{ '--ui-avatar-ring': 'var(--ui-surface)' } as CSSProperties} aria-label="Members">
            {TEAM.map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </CardContent>
      </Card>
    </div>
  );
}
