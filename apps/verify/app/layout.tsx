import type { ReactNode } from 'react';

const themeFromQuery = `(function(){var p=new URLSearchParams(location.search);if(p.get('theme')==='dark')document.documentElement.classList.add('dark');var a=p.get('accent');if(a)document.documentElement.setAttribute('data-accent',a);})();`;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeFromQuery }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
