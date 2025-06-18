import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Apple, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const DownloadAppPage = () => {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative bg-primary/5 dark:bg-primary/10 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 z-10 relative">
          <Smartphone className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Care Right At Your Fingertips
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get the full CarePop experience on your mobile device. Book appointments, track your health, and connect with providers, all on the go.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <Card className="max-w-4xl mx-auto border-t-4 border-primary shadow-lg">
          <CardHeader className="text-center">
            <Download className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
            <CardTitle className="text-2xl sm:text-3xl">Download the App</CardTitle>
            <p className="text-muted-foreground pt-2">
              Available soon for iOS and Android devices.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            
            {/* iOS Card */}
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center transition-all hover:shadow-xl hover:scale-105">
              <Apple className="h-12 w-12 text-gray-700 dark:text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">For Apple iOS</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                Get the app on your iPhone or iPad from the Apple App Store.
              </p>
              <Button disabled className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" /> Coming Soon
              </Button>
            </div>

            {/* Android Card */}
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg text-center transition-all hover:shadow-xl hover:scale-105">
              <div className="h-12 w-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M2.5 7.5L12 2.5L21.5 7.5L12 21.5Z" fill="currentColor" stroke="none"/>
                  <path d="M2.5 7.5L12 12.5L21.5 7.5" />
                  <path d="M12 2.5V12.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">For Android</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                Find us on the Google Play Store for all Android devices.
              </p>
              <Button disabled className="w-full bg-green-600 hover:bg-green-700" size="lg">
                <Download className="mr-2 h-4 w-4" /> Coming Soon
              </Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DownloadAppPage; 