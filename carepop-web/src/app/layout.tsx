import { Inter, Space_Grotesk as spaceGroteskFont } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import Header from '../components/layout/Header'
import ConditionalFooter from '../components/layout/ConditionalFooter'
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = spaceGroteskFont({ subsets: ['latin'], variable: '--font-space-grotesk'})

export const metadata: Metadata = {
  title: 'CarePop',
  description: 'A modern, inclusive, and accessible healthcare platform for the queer community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: 'hsl(349 100% 65%)',
          colorText: 'hsl(210 11% 15%)',
          colorBackground: 'hsl(0 0% 100%)',
          colorInputBackground: 'hsl(0 0% 100%)',
          colorInputText: 'hsl(210 11% 15%)',
          borderRadius: '0.5rem',
        },
      }}
    >
      <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
        <body className="flex flex-col min-h-full bg-background text-foreground antialiased">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Toaster />
            <ConditionalFooter />
        </body>
      </html>
    </ClerkProvider>
  )
}
