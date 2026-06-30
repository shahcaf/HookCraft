import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HookCraft — Discord Webhook Builder',
  description:
    'Build, preview, and send Discord webhook messages with a powerful visual editor. Supports embeds, buttons, polls, and more.',
  keywords: ['discord', 'webhook', 'builder', 'embed', 'bot', 'message'],
  authors: [{ name: 'HookCraft' }],
  openGraph: {
    title: 'HookCraft — Discord Webhook Builder',
    description: 'Build beautiful Discord webhook messages with live preview.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <main className="flex-1 flex flex-col min-h-0 relative">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
