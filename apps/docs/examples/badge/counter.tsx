import { Badge, BadgeAnchor, Button, Icon } from 'ui-kit';

export default function BadgeCounter() {
  return (
    <div className="flex items-center gap-8">
      <BadgeAnchor>
        <Button variant="outline" icon aria-label="Notifications">
          <Icon name="bell" />
        </Button>
        <Badge variant="destructive" solid size="sm">
          3<span className="sr-only"> unread</span>
        </Badge>
      </BadgeAnchor>
      <BadgeAnchor>
        <Button variant="outline" icon aria-label="Inbox">
          <Icon name="inbox" />
        </Button>
        <Badge variant="info" solid size="sm">
          12<span className="sr-only"> new messages</span>
        </Badge>
      </BadgeAnchor>
    </div>
  );
}
