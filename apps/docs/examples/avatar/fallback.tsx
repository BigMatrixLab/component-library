import { Avatar, AvatarFallback, AvatarImage, Icon, getInitials } from 'ui-kit';

/** Not a real image, so it fails to decode, like an expired URL would */
const BROKEN = 'data:image/png;base64,AAAA';

export default function AvatarFallbackExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <figure className="flex flex-col items-center gap-2">
        {/* The image fails to load, so the initials show instead */}
        <Avatar size="lg">
          <AvatarImage src={BROKEN} alt="Tomás Herrera" />
          <AvatarFallback>{getInitials('Tomás Herrera')}</AvatarFallback>
        </Avatar>
        <figcaption className="text-xs text-muted-foreground">Image fails</figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-2">
        <Avatar size="lg">
          <AvatarFallback>{getInitials('Priya Nair')}</AvatarFallback>
        </Avatar>
        <figcaption className="text-xs text-muted-foreground">No image</figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-2">
        <Avatar size="lg">
          <AvatarFallback>
            <Icon name="user" />
          </AvatarFallback>
        </Avatar>
        <figcaption className="text-xs text-muted-foreground">Icon</figcaption>
      </figure>
    </div>
  );
}
