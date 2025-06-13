'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { api } from '../apiClient';
import { SignUpData, LoginData, ResetPasswordData } from '../types/authActionTypes';
import { isAxiosError } from 'axios';

// More specific user profile type
interface UserProfile {
    id: string;
    email?: string;
    roles: string[];
    [key: string]: unknown; // Allow other profile properties
}

// Data shape returned from our backend login
interface AuthResponseData {
    session: Session;
    user: UserProfile;
}

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    login: (data: LoginData) => Promise<void>;
    signUp: (data: SignUpData) => Promise<{ data: { message: string } }>;
    loginWithGoogle: (code: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<{ data: { message: string } }>;
    resetPassword: (data: ResetPasswordData) => Promise<{ data: { message: string } }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const storeSession = (sessionData: AuthResponseData) => {
        // Store in a cookie that the middleware can read.
        // The cookie will expire in 7 days.
        Cookies.set('session', JSON.stringify(sessionData), { expires: 7, path: '/' });
        setUser(sessionData.user);
        setSession(sessionData.session);
    };

    const clearSession = () => {
        Cookies.remove('session', { path: '/' });
        setUser(null);
        setSession(null);
    };

    useEffect(() => {
        const checkUserSession = () => {
            try {
                const sessionString = Cookies.get('session');
                if (sessionString) {
                    const storedSession: AuthResponseData = JSON.parse(sessionString);
                    setUser(storedSession.user);
                    setSession(storedSession.session);
                }
            } catch (e) {
                console.error('Failed to load session from cookie:', e);
                clearSession();
            } finally {
                setLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const handleAuth = async (authPromise: Promise<{ data: AuthResponseData }>) => {
        try {
            const { data } = await authPromise;
            storeSession(data);
        } catch (error) {
            if (isAxiosError(error)) {
                console.error('Auth error:', error.response?.data?.message || error.message);
            } else {
                console.error('Auth error:', (error as Error).message);
            }
            clearSession();
            throw error;
        }
    };

    const login = async (data: LoginData) => {
        await handleAuth(api.login(data));
    };

    const loginWithGoogle = async (code: string) => {
        await handleAuth(api.loginWithGoogle(code));
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
    
    const logout = () => {
        // Here you might want to call a backend endpoint to invalidate the token
        clearSession();
    };

    return (
        <AuthContext.Provider value={{ user, session, login, signUp, loginWithGoogle, forgotPassword, resetPassword, logout, loading }}>
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