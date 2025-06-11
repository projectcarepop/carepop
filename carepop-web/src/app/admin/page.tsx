'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import AccessDenied from '@/components/layout/AccessDenied';
import AdminDashboard from './components/AdminDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


export default function AdminPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }
    
    const is_admin = user?.roles?.includes('Admin');

    if (!is_admin) {
        return <AccessDenied pageName="Admin Dashboard" />;
    }

    return <AdminDashboard />;
} 