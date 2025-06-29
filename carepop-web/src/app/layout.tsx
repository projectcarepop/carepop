import { Inter } from 'next/font/google';
import type { Metadata } from "next";
import './globals.css'
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/lib/contexts/auth-context';
import QueryProvider from '@/providers/QueryProvider';
import Header from '@/components/layout/Header';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Carepop',
  description: 'Your health, your space.',
  icons: {
    icon: '/carepop-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
        <head />
        <body className={cn(
          "flex flex-col min-h-full bg-background text-foreground antialiased font-inter"
        )}>
            <AuthProvider>
              <QueryProvider>
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Toaster />
                <ConditionalFooter />
                <Analytics />
                <SpeedInsights />
              </QueryProvider>
            </AuthProvider>
         </body>
     </html>
  )
}