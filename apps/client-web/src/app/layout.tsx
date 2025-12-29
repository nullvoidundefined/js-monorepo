import type { Metadata } from 'next';

import '@application/styles/globals.css';

export const metadata: Metadata = {
  title: 'Client Web App',
  description: 'A Next.js application in a Turborepo monorepo',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

