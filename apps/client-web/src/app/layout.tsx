import type { Metadata } from 'next';

import '@client-web/style/globals.scss';
import { QueryProvider } from 'src/state/provider/queryProvider';

export const metadata: Metadata = {
  description: 'A Next.js application in a Turborepo monorepo',
  icons: {
    icon: '/favicon.svg',
  },
  title: 'Client Web App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
