'use client';

import { Button, Icon, THEME_ACCENTS, useTheme, cn } from 'ui-kit';

const swatch: Record<string, string> = {
  neutral: 'var(--ui-gray-800)',
  violet: 'var(--ui-violet-600)',
  blue: 'var(--ui-blue-600)',
  emerald: 'var(--ui-emerald-600)',
  rose: 'var(--ui-rose-600)',
  amber: 'var(--ui-amber-500)',
  orange: 'var(--ui-orange-600)',
};

export function AccentPicker({ className }: { className?: string }) {
  const { accent, setAccent } = useTheme();
  return (
    <div className={cn('flex items-center gap-1.5', className)} role="radiogroup" aria-label="Accent colour">
      {THEME_ACCENTS.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={accent === a}
          aria-label={`${a} accent`}
          title={a}
          onClick={() => setAccent(a)}
          className="size-4 cursor-pointer rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.12)] transition-transform duration-150 hover:scale-115 aria-checked:shadow-[0_0_0_2px_var(--ui-background),0_0_0_3.5px_var(--c)]"
          style={{ background: swatch[a], ['--c' as string]: swatch[a] }}
        />
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { resolvedMode, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" icon aria-label="Toggle dark mode" onClick={toggle}>
      <Icon name={resolvedMode === 'dark' ? 'moon' : 'sun'} />
    </Button>
  );
}
