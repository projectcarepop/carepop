import axios from 'axios';

// Basic types to satisfy the linter and improve safety.
// For a fully shared setup, consider a shared types package.
interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
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
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(config => {
    try {
        const sessionString = localStorage.getItem('session');
        if (sessionString) {
            const session = JSON.parse(sessionString);
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        }
    } catch (e) {
        console.error("Could not parse session from localStorage", e);
    }
    return config;
});

export const api = {
    signUp: (data: SignUpData) => apiClient.post('/public/auth/signup', data),
    login: (data: LoginData) => apiClient.post('/public/auth/login', data),
    loginWithGoogle: (code: string) => apiClient.post('/public/auth/login-google', { code }),
    forgotPassword: (email: string) => apiClient.post('/public/auth/forgot-password', { email }),
    resetPassword: (data: ResetPasswordData) => apiClient.post('/public/auth/reset-password', data),
}; 