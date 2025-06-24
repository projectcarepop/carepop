'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  email?: string;
} | null;

export default function MobileNav({ user }: { user: User }) {
  return (
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
          
          {user && (
            <>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent hover:text-primary focus:text-primary font-medium">
                <Link href="/appointments">My Appointments</Link>
              </DropdownMenuItem>
            </>
          )}

          {!user && (
            <>
              <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent text-secondary hover:text-primary focus:text-primary font-medium rounded-md">
                <Link href="/download-app">Download our App</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 font-semibold rounded-md">
                <Link href="/sign-in" className="flex items-center justify-between w-full group">
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 