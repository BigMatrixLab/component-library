import { highlight, type CodeLang } from '@/lib/highlight';
import { CopyButton } from './copy-button';

/** Highlighted code with a copy button. Server Component. */
export async function CodeBlock({ code, lang = 'tsx', title }: { code: string; lang?: CodeLang; title?: string }) {
  const html = await highlight(code.trim(), lang);
  return (
    <div className="docs-code relative mb-6 overflow-hidden rounded-xl border border-border bg-muted/40">
      {title && <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">{title}</div>}
      <div className="max-h-[28rem] overflow-auto p-4 pr-12 text-sm" dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton text={code.trim()} className="absolute top-2.5 right-2.5" />
    </div>
  );
}
