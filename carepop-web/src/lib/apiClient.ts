import axios from 'axios';
import Cookies from 'js-cookie';

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

apiClient.interceptors.request.use(config => {
    try {
        const sessionString = Cookies.get('session');
        if (sessionString) {
            const sessionData = JSON.parse(sessionString);
            // The access token is nested inside the 'session' object
            if (sessionData?.session?.access_token) {
                config.headers.Authorization = `Bearer ${sessionData.session.access_token}`;
            }
        }
    } catch (e) {
        console.error("Could not parse session from cookie:", e);
    }
    return config;
});

export const api = {
    signUp: (data: SignUpData) => apiClient.post('/api/v1/public/auth/signup', data),
    login: (data: LoginData) => apiClient.post('/api/v1/public/auth/login', data),
    loginWithGoogle: (code: string) => apiClient.post('/api/v1/public/auth/login-google', { code }),
    forgotPassword: (email: string) => apiClient.post('/api/v1/public/auth/forgot-password', { email }),
    resetPassword: (data: ResetPasswordData) => apiClient.post('/api/v1/public/auth/reset-password', data),
    getProfile: (userId: string) => apiClient.get(`/api/v1/public/users/${userId}/profile`),
}; 