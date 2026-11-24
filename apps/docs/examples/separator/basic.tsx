import { Separator } from 'ui-kit';

export default function SeparatorBasic() {
  return (
    <div className="w-full max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Atlas design system</h4>
        <p className="text-sm text-muted-foreground">Tokens, components and docs for every product.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
        <Separator orientation="vertical" />
        <span>Roadmap</span>
      </div>
    </div>
  );
}
