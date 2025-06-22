'use client'

import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster"
import AdminSidebar from '@/components/layout/AdminSidebar';

// TODO: Add proper role-based access control to this layout

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
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