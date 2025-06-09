import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/contexts/AuthContext"; // Assuming this path
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.carepop.ph'), // Assuming this is the production URL
  title: {
    default: 'CarePoP - Your Partner in Health', // Default title for all pages
    template: '%s | CarePoP', // Template for page-specific titles
  },
  description: "CarePoP is a comprehensive healthcare platform providing access to services, information, and support. Your partner in health and wellness.",
  keywords: ['healthcare', 'telemedicine', 'clinic finder', 'doctor appointment', 'health services', 'wellness', 'CarePoP'],
  authors: [{ name: 'CarePoP Team' }],
  creator: 'CarePoP Team',
  publisher: 'CarePoP',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.carepop.ph',
    title: 'CarePoP - Your Partner in Health',
    description: "CarePoP is a comprehensive healthcare platform providing access to services, information, and support.",
    siteName: 'CarePoP',
    // images: [
    //   {
    //     url: 'https://www.carepop.ph/og-image.png', // Replace with actual OG image URL
    //     width: 1200,
    //     height: 630,
    //     alt: 'CarePoP Logo and Tagline',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    // site: '@carepop', // Replace with your Twitter handle
    // creator: '@carepopdevteam', // Replace with your dev team Twitter handle
    title: 'CarePoP - Your Partner in Health',
    description: "CarePoP is a comprehensive healthcare platform providing access to services, information, and support.",
    // images: ['https://www.carepop.ph/twitter-image.png'], // Replace with actual Twitter image URL
  },
  icons: {
    icon: '/favicon.ico',
    // shortcut: '/favicon-16x16.png', // Example
    // apple: '/apple-touch-icon.png', // Example
  },
  // manifest: '/site.webmanifest', // If you have a web app manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <body className="flex flex-col min-h-full bg-background text-foreground antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
