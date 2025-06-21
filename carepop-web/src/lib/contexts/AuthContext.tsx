'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../apiClient';

// More specific user profile type
export interface UserProfile {
    id: string; // from users table
    email?: string; // from users table
    roles: string[]; // from user_roles table
    
    // Properties from profiles table (snake_case)
    first_name?: string | null;
    last_name?: string | null;
    middle_initial?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
    age?: number | null;
    gender_identity?: string | null;
    pronouns?: string | null;
    assigned_sex_at_birth?: string | null;
    civil_status?: string | null;
    religion?: string | null;
    occupation?: string | null;
    contact_no?: string | null;
    philhealth_no?: string | null;
    street?: string | null;
    barangay_code?: string | null;
    city_municipality_code?: string | null;
    province_code?: string | null;
}

interface AuthContextType {
    user: UserProfile | null;
    // We no longer manage the session object on the client. It's handled by httpOnly cookies.
    fetchUser: () => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const { data: profile } = await api.getProfile();
            setUser(profile);
        } catch {
            // This is expected if the user is not logged in (e.g., API returns 401)
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const signOut = async () => {
        try {
            // This will call a new backend endpoint that handles cookie invalidation
            await api.logout(); 
            setUser(null);
            // Redirect to login page after signing out
            router.push('/login');
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            isAuthenticated: !!user, // Derived state for convenience
            fetchUser, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 