import { Button, Icon, Kbd, KbdGroup } from 'ui-kit';

const ACTIONS = [
  { label: 'New project', keys: ['⌘', 'N'] },
  { label: 'Search files', keys: ['⌘', 'P'] },
  { label: 'Toggle sidebar', keys: ['⌘', 'B'] },
];

export default function KbdInContext() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <ul className="divide-y divide-border rounded-lg border border-border">
        {ACTIONS.map((a) => (
          <li key={a.label} className="flex items-center justify-between px-3 py-2 text-sm">
            {a.label}
            <KbdGroup aria-label={`Shortcut: ${a.keys.join(' ')}`}>
              {a.keys.map((k) => (
                <Kbd key={k} size="sm">
                  {k}
                </Kbd>
              ))}
            </KbdGroup>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="justify-between">
        <span className="inline-flex items-center gap-2">
          <Icon name="search" />
          Search docs
        </span>
        <Kbd size="sm">/</Kbd>
      </Button>
      <p className="text-sm text-muted-foreground">
        Press <Kbd size="sm">Esc</Kbd> to close the panel, or <Kbd size="sm">Enter</Kbd> to confirm.
      </p>
    </div>
  );
}
