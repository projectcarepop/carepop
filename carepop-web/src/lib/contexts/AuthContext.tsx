'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '../supabase/client';
import { api } from '../apiClient';
import { LoginData, ResetPasswordData, SignUpData } from '../types/authActionTypes';

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
    session: Session | null;
    fetchProfile: () => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    signUp: (data: SignUpData) => Promise<{ data: { message: string } }>;
    loginWithGoogle: (code: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<{ data: { message: string } }>;
    resetPassword: (data: ResetPasswordData) => Promise<{ data: { message: string } }>;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const supabase = createSupabaseBrowserClient();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const getProfile = async (user: User) => {
        try {
            const { data: profile } = await api.getProfile(user.id);
            return profile;
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            return null;
        }
    };

    const fetchProfile = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const profile = await getProfile(authUser);
            setUser(profile);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setLoading(true);
                if (session && session.user) {
                    const profile = await getProfile(session.user);
                    setUser(profile);
                    setSession(session);
                } else {
                    setUser(null);
                    setSession(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const login = async (data: LoginData) => {
        const { error } = await supabase.auth.signInWithPassword(data);
        if (error) throw error;
    };

    const loginWithGoogle = async (code: string) => {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
    };

    const signUp = async (data: SignUpData) => {
        return await api.signUp(data);
    };

    const forgotPassword = async (email: string) => {
        return await api.forgotPassword(email);
    };

    const resetPassword = async (data: ResetPasswordData) => {
        return await api.resetPassword(data);
    };
    
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, login, signUp, loginWithGoogle, forgotPassword, resetPassword, signOut, loading, fetchProfile }}>
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