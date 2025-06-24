import { Inter, Space_Grotesk as SpaceGrotesk } from 'next/font/google';
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
const spaceGrotesk = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Carepop',
  description: 'Your health, your space.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`} suppressHydrationWarning>
        <head />
        <body className={cn(
          "flex flex-col min-h-full bg-background text-foreground antialiased",
          spaceGrotesk.variable,
          inter.variable
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
