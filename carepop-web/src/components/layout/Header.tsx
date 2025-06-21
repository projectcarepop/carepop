'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="bg-background text-foreground sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src="/carepop-logo.png"
            alt="CarePoP Logo"
            width={24}
            height={24}
            className="h-6 w-6 mr-1"
          />
          <span className="text-2xl font-bold text-primary hover:text-primary/90 font-space-grotesk">
            carepop
          </span>
        </Link>

        {/* Desktop Navigation */}
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
                <Link href="/clinic-finder" className="hover:text-primary focus:text-primary">Find a Clinic</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
                <Link href="/book-service" className="hover:text-primary focus:text-primary">Book a Service</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <SignedOut>
            <Button variant="outline" asChild className="text-secondary rounded-full hover:text-primary hover:border-primary hover:bg-background px-4 py-2 text-sm font-medium focus:outline-none">
              <Link href="/download-app">Download our App</Link>
            </Button>
            <Button variant="default" asChild className="bg-primary text-background rounded-full px-4 py-2 text-sm font-medium focus:outline-none">
              <Link href="/sign-up" className="flex items-center group">
                Get Started
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="ml-2 bg-background text-primary rounded-full p-1 flex items-center justify-center"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="flex items-center text-sm font-medium text-secondary hover:text-primary px-3 py-2 rounded-md focus:outline-none">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary focus:outline-none">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/contact">Contact Us</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/book-service">Book a Service</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/clinic-finder">Find a Clinic</Link>
              </DropdownMenuItem>
              
              <SignedIn>
                  <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                    <Link href="/appointments">My Appointments</Link>
                  </DropdownMenuItem>
              </SignedIn>

              <SignedOut>
                  <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent text-secondary hover:text-primary focus:text-primary font-medium rounded-md">
                    <Link href="/download-app">Download our App</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 font-semibold rounded-md">
                    <Link href="/sign-up" className="flex items-center justify-between w-full group">
                      <span>Get Started</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: 2
                        }}
                      >
                        <ArrowRight className="h-5 w-5 ml-2 text-primary-foreground" />
                      </motion.span>
                    </Link>
                  </DropdownMenuItem>
              </SignedOut>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}