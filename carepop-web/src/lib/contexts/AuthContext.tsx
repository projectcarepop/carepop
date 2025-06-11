'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { api } from '../apiClient';

// Define a more specific type for our user object, including the roles
export interface UserProfile extends User {
    roles: string[];
    first_name?: string;
    last_name?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (data: any) => Promise<any>;
    login: (data: any) => Promise<any>;
    loginWithGoogle: (code: string) => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (data: any) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const storeSession = (session: Session) => {
        localStorage.setItem('session', JSON.stringify(session));
    };

    const loadSession = (): Session | null => {
        const storedSessionJSON = localStorage.getItem('session');
        return storedSessionJSON ? JSON.parse(storedSessionJSON) : null;
    };

    const clearSession = () => {
         localStorage.removeItem('session');
    };

    useEffect(() => {
        const checkUserSession = () => {
            try {
                const storedSession = loadSession();
                if (storedSession) {
                    setSession(storedSession);
                    setUser(storedSession.user as UserProfile);
                }
            } catch (e) {
                console.error('Failed to load session:', e);
                clearSession();
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const handleAuth = async (authPromise: Promise<any>) => {
        try {
            const { data } = await authPromise;
            storeSession(data.session);
            setSession(data.session);
            setUser(data.user as UserProfile);
            return { data };
        } catch (error: any) {
            console.error("Auth error:", error.response?.data?.message || error.message);
            throw error;
        }
    };
    
    const value = {
        user,
        session,
        isLoading,
        signUp: (data: any) => handleAuth(api.signUp(data)),
        login: (data: any) => handleAuth(api.login(data)),
        loginWithGoogle: (code: string) => handleAuth(api.loginWithGoogle(code)),
        forgotPassword: (email: string) => api.forgotPassword(email),
        resetPassword: (data: any) => api.resetPassword(data),
        logout: async () => {
            clearSession();
            setUser(null);
            setSession(null);
        },
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 