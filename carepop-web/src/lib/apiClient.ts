import axios from 'axios';
import Cookies from 'js-cookie';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Basic types to satisfy the linter and improve safety.
// For a fully shared setup, consider a shared types package.
interface SignUpData {
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface ResetPasswordData {
    token: string;
    password: string;
}

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use an async interceptor to correctly get the Supabase session
apiClient.interceptors.request.use(async (config) => {
    try {
        // We only run this logic on the client-side
        if (typeof window !== 'undefined') {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        }
    } catch (e) {
        console.error("Error setting auth token in apiClient:", e);
    }
    return config;
});

export const api = {
    signUp: async (data: SignUpData) => {
        try {
            return await apiClient.post('/api/v1/public/auth/signup', data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Signup Error Response from Backend:", error.response?.data);
            }
            throw error;
        }
    },
    login: (data: LoginData) => apiClient.post('/api/v1/public/auth/login', data),
    loginWithGoogle: (code: string) => apiClient.post('/api/v1/public/auth/login-google', { code }),
    forgotPassword: (email: string) => apiClient.post('/api/v1/public/auth/forgot-password', { email }),
    resetPassword: (data: ResetPasswordData) => apiClient.post('/api/v1/public/auth/reset-password', data),
    getProfile: (userId: string) => apiClient.get(`/api/v1/public/users/${userId}/profile`),
};

export default apiClient; 