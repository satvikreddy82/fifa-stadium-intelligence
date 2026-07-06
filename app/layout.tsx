import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'sonner';
import { FloatingAssistant } from '@/components/ai/floating-assistant';
import { AccessibilityToolbar } from '@/components/accessibility/accessibility-toolbar';
import { A11yFilters } from '@/components/accessibility/a11y-filters';
import { CustomCursor } from '@/components/layout/custom-cursor';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FIFA StadiumIQ 2026 – AI-Powered Stadium Operations',
    template: '%s | FIFA StadiumIQ 2026',
  },
  description:
    'Generative AI-powered platform for FIFA World Cup 2026 stadium operations. Enhancing fan experience, crowd management, accessibility, transportation, and emergency response.',
  keywords: [
    'FIFA World Cup 2026', 'stadium operations', 'AI', 'crowd management',
    'stadium navigation', 'accessibility', 'transportation', 'emergency response',
  ],
  authors: [{ name: 'FIFA StadiumIQ Team' }],
  creator: 'FIFA StadiumIQ 2026',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'FIFA StadiumIQ 2026',
    description: 'AI-Powered Stadium Operations Platform for FIFA World Cup 2026',
    siteName: 'FIFA StadiumIQ 2026',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIFA StadiumIQ 2026',
    description: 'AI-Powered Stadium Operations Platform for FIFA World Cup 2026',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
    { media: '(prefers-color-scheme: light)', color: '#f5f7ff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <A11yFilters />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <QueryProvider>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <CustomCursor />
            <FloatingAssistant />
            <AccessibilityToolbar />
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: 'glass border-border',
                  title: 'text-foreground font-semibold',
                  description: 'text-muted-foreground',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
