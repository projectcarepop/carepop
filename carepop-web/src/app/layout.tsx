import { Inter, Space_Grotesk as spaceGroteskFont } from 'next/font/google'
import { Toaster as SonnerToaster } from 'sonner';
import './globals.css'
import ConditionalHeader from '../components/layout/ConditionalHeader'
import ConditionalFooter from '../components/layout/ConditionalFooter'
import { AuthProvider } from '../lib/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = spaceGroteskFont({ subsets: ['latin'], variable: '--font-space-grotesk'})

export const metadata = {
  title: 'CarePop',
  description: 'A modern, inclusive, and accessible healthcare platform for the queer community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
        <body className="flex flex-col min-h-full bg-background text-foreground antialiased">
            <AuthProvider>
                <ConditionalHeader />
                <main className="flex-grow">
                    {children}
                </main>
                <ConditionalFooter />
                <SonnerToaster richColors />
            </AuthProvider>
        </body>
    </html>
  )
}
