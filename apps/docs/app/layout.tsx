import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeScript } from 'ui-kit';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'ui-kit', template: '%s · ui-kit' },
  description: 'Our own React component library: calm, fast, accessible, with a soft-rise motion signature.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
