/**
 * <ThemeScript /> — put it in <head> (Next.js: app/layout.tsx). It applies the
 * saved mode and accent before the first paint, so there is no light flash.
 * Server Component–safe. Pair with `useTheme()` in client components.
 */

export const THEME_STORAGE = { mode: 'ui-theme-mode', accent: 'ui-theme-accent' } as const;

export const themeBootScript = `(function(){try{var d=document.documentElement,m=localStorage.getItem('${THEME_STORAGE.mode}')||'system',a=localStorage.getItem('${THEME_STORAGE.accent}');if(m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark');if(a&&a!=='neutral')d.setAttribute('data-accent',a);}catch(e){}})();`;

export interface ThemeScriptProps {
  /** CSP nonce, if your app uses one. */
  nonce?: string;
}

export function ThemeScript({ nonce }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeBootScript }} />;
}
