'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import AccessDenied from '@/components/layout/AccessDenied';
import AdminDashboard from './components/AdminDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserProfile } from '@/lib/contexts/AuthContext'; // Re-use the type for now

export default function AdminPage() {
    const { session } = useAuth();
    const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            if (!session) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/v1/admin/users/me', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                       throw new Error('You are not authorized to view this page.');
                    }
                    throw new Error('Failed to fetch admin profile.');
                }
                const data = await res.json();
                setAdminUser(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !adminUser) {
        return <AccessDenied pageName="Admin Dashboard" />;
    }
    
    // Perform a case-insensitive check for the 'admin' role.
    const isAdmin = adminUser?.roles?.some(role => role.toLowerCase() === 'admin');

    if (!isAdmin) {
        return <AccessDenied pageName="Admin Dashboard" />;
    }

    return <AdminDashboard adminUser={adminUser} />;
} 