import type { Metadata } from 'next';

import '@client-web/style/global.scss';
import { ThemeToggle } from '@client-web/components/themeToggle';
import { QueryProvider } from 'src/state/provider/queryProvider';

export const metadata: Metadata = {
  description: 'A Next.js application in a Turborepo monorepo',
  icons: {
    icon: '/favicon.svg',
  },
  title: 'Client Web App',
};

/**
 * Static script to prevent flash of unstyled content (FOUC).
 * This must run synchronously before React hydrates.
 * 
 * Security: This script is safe because:
 * - Content is static and controlled (no user input)
 * - Only reads from localStorage and sets a DOM attribute
 * - No dynamic data or external sources
 */
const THEME_INIT_SCRIPT = `
  (function() {
    const theme = localStorage.getItem('app-theme');
    if (theme && theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeToggle />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
