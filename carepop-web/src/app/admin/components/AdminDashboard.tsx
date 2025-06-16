'use client';
import { UserProfile } from '@/lib/contexts/AuthContext';
import React from 'react';

type AdminDashboardProps = {
    adminUser: UserProfile | null;
    children: React.ReactNode;
};

// Main page component
export default function AdminDashboard({ adminUser, children }: AdminDashboardProps) {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-semibold tracking-tight">Welcome, {adminUser?.first_name || 'Admin'}!</h1>
                <p className="text-muted-foreground mt-1">
                    This is your central hub for managing the carepop platform. From here, you can manage services, oversee providers, view user information (with appropriate permissions), manage inventory, and generate reports to ensure the smooth operation and impact of our healthcare services.
                </p>
            </div>
            {children}
        </div>
    );
} 