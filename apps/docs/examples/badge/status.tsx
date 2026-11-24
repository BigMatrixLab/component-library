import { Badge, Icon } from 'ui-kit';

export default function BadgeStatus() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="success" dot>Paid</Badge>
        <Badge variant="warning" dot>Pending</Badge>
        <Badge variant="destructive" dot>Failed</Badge>
        <Badge variant="info" dot>Draft</Badge>
        <Badge variant="success" live>Live</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="success">
          <Icon name="circle-check" />
          Verified
        </Badge>
        <Badge variant="warning">
          <Icon name="triangle-alert" />
          Expires in 3 days
        </Badge>
        <Badge variant="destructive">
          <Icon name="circle-x" />
          Declined
        </Badge>
        <Badge variant="info" solid>New</Badge>
      </div>
    </div>
  );
}
