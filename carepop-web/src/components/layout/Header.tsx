'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/lib/contexts/auth-context';
import { UserNav } from './UserNav';
import GetStartedBtn from './GetStartedBtn';
import MobileNav from './MobileNav';

export default function Header() {
  const { user, isLoading, isInitialized } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center">
          <Image 
            src="/carepop-logo.png"
            alt="CarePoP Logo"
            width={24}
            height={24}
            className="h-6 w-6 mr-1"
          />
          <span className="text-xl font-medium text-primary hover:text-primary/90 font-space-grotesk">
            {isAdminPage ? 'carepop admin' : 'carepop'}
          </span>
        </Link>

        {/* Desktop Navigation - Hide on admin pages */}
        {!isAdminPage && (
          <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
            <Link href="/" className="flex items-center text-sm font-medium text-secondary hover:text-primary px-3 py-2 rounded-md">
              Home
            </Link>
            <Link href="/about" className="flex items-center text-sm font-medium text-secondary hover:text-primary px-3 py-2 rounded-md">
              About
            </Link>
            <Link href="/contact" className="flex items-center text-sm font-medium text-secondary hover:text-primary px-3 py-2 rounded-md">
              Contact Us
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm font-medium text-secondary hover:text-primary hover:bg-transparent px-3 py-2 rounded-md">
                  Services
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
                  <Link href="/find-a-clinic" className="hover:text-primary focus:text-primary">Find a Clinic</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
                  <Link href="/book-appointment" className="hover:text-primary focus:text-primary">Book a Service</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!isInitialized || isLoading ? (
            // Show loading skeleton during auth initialization
            <div className="flex items-center space-x-4">
              <div className="h-9 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ) : !user ? (
            <>
              <Button variant="outline" asChild className="text-secondary rounded-full hover:text-primary hover:border-primary hover:bg-background px-4 py-2 text-sm font-medium focus:outline-none">
                <Link href="/download-app">Download our App</Link>
              </Button>
              <GetStartedBtn />
            </>
          ) : (
            <>
              {isAdminPage ? (
                <div className="flex items-center space-x-4">
                  <Button variant="outline" asChild>
                    <Link href="/" className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Website
                    </Link>
                  </Button>
                  <UserNav />
                </div>
              ) : (
                <UserNav />
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button - Hide on admin pages */}
        {!isAdminPage && (
          <MobileNav user={isInitialized && !isLoading ? user : null} />
        )}
      </nav>
    </header>
  );
}