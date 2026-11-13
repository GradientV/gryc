import type { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';
import { Suspense } from 'react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { TabBar, TabBarFallback } from '@/components/layout/nav';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

/* Public Sans: the U.S. Web Design System's typeface, drawn for forms,
   tables and long-form government text. */
const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'GRYC SYEP Portal', template: '%s · GRYC SYEP Portal' },
  description:
    'Site monitoring for the Greater Ridgewood Youth Council Summer Youth Employment Program: visits, timesheets, worksite assessments and paperwork.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main" className="shell flex-1 pt-5 pb-4 md:pt-6">
            {children}
          </main>
          <Footer />
          <Suspense fallback={<TabBarFallback />}>
            <TabBar />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
