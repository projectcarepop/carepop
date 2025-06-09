'use client'

import { ReactNode } from 'react';
import { Toaster } from "sonner";
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Home, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminHeader = () => {
    return (
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-3">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button
                        variant="outline"
                        size="icon"
                        className="sm:hidden"
                        >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <AdminSidebar />
                    </SheetContent>
                </Sheet>
                 <Image 
                    src="/carepop-logo.png"
                    alt="CarePoP Logo"
                    width={32}
                    height={32}
                    className="hidden sm:block"
                />
                <h1 className="text-xl font-semibold tracking-tight hidden sm:block">CAREPOP ADMIN</h1>
            </div>
            
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Website
                    </Link>
                </Button>
            </div>
        </header>
    )
}

// TODO: Add proper role-based access control to this layout

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AdminHeader />
        <div className="flex flex-1">
            <AdminSidebar />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
       <Toaster />
    </div>
  );
} 