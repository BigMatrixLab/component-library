/**
 * <ThemeScript /> — put it in <head> (Next.js: app/layout.tsx). It applies the
 * saved mode, accent and theme pack before the first paint, so there is no
 * light flash and no flash of the default pack.
 * Server Component–safe. Pair with `useTheme()` in client components.
 */

export const THEME_STORAGE = { mode: 'ui-theme-mode', accent: 'ui-theme-accent', pack: 'ui-theme-pack' } as const;

/** Built-in theme packs (styles/tokens/themes). `neutral` = no `data-theme` attribute. */
export type ThemePack = 'neutral' | 'stone' | 'slate' | 'soft' | 'mono';
export const THEME_PACKS: ThemePack[] = ['neutral', 'stone', 'slate', 'soft', 'mono'];

/**
 * Pack: nothing saved → leave whatever the server rendered (`<html data-theme="stone">`);
 * saved `neutral` → remove the attribute; any other saved name → set it.
 * Names are limited to [a-z0-9-] so a tampered value can't do anything odd.
 */
export const themeBootScript = `(function(){try{var d=document.documentElement,m=localStorage.getItem('${THEME_STORAGE.mode}')||'system',a=localStorage.getItem('${THEME_STORAGE.accent}'),p=localStorage.getItem('${THEME_STORAGE.pack}');if(m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark');if(a&&a!=='neutral')d.setAttribute('data-accent',a);if(p&&/^[a-z0-9-]+$/.test(p)){if(p==='neutral')d.removeAttribute('data-theme');else d.setAttribute('data-theme',p);}}catch(e){}})();`;

export interface ThemeScriptProps {
  /** CSP nonce, if your app uses one. */
  nonce?: string;
}

export function ThemeScript({ nonce }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeBootScript }} />;
}
