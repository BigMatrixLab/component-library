import 'server-only';
import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Promise<Highlighter> | undefined;

const langs = ['tsx', 'ts', 'css', 'bash', 'json', 'markdown'] as const;
export type CodeLang = (typeof langs)[number];

/** Server-side syntax highlighting with light + dark colours as CSS variables. */
export async function highlight(code: string, lang: CodeLang) {
  highlighter ??= createHighlighter({ themes: ['github-light', 'github-dark-default'], langs: [...langs] });
  return (await highlighter).codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark-default' },
    defaultColor: false,
  });
}
