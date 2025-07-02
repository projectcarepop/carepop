import { Button } from '@/components/ui/button';
import Image from "next/image";
import Link from "next/link";
import React from 'react';

export default function DownloadAppPage() {
  return (
    <main className="w-full">
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-space-grotesk text-primary">
                        Take Your Care On The Go
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl font-inter">
                        Download the CarePoP mobile app to manage your appointments, connect with providers, and access your health records anytime, anywhere. Your inclusive health journey, right in your pocket.
                    </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                    <Link href="#" passHref>
                        <Button size="lg" className="w-full min-[400px]:w-auto">
                            Download on the App Store
                        </Button>
                    </Link>
                    <Link href="#" passHref>
                        <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                            Get it on Google Play
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex justify-center">
                <Image
                    src="/carepop-app-mockup.png"
                    height={600}
                    alt="CarePoP mobile app running on a smartphone"
                    className="rounded-2xl shadow-2xl"
                />
            </div>
        </div>
      </section>
    </main>
  );
} 