import { Badge } from 'ui-kit';

export default function BadgeVariants() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge>Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  );
}
