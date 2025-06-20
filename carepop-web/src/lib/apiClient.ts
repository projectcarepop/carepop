import axios from 'axios';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// A generic type for email/password authentication data.
interface AuthData {
    email: string;
    password: string;
}

const getApiBaseUrl = () => {
    // For development, we hardcode the new backend URL.
    // In a real environment, this would come from NEXT_PUBLIC_API_URL.
    return 'http://localhost:3000';
}

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
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
    // These functions now call our new Hono backend
    register: (data: AuthData) => apiClient.post('/api/v1/auth/register', data),
    login: (data: AuthData) => apiClient.post('/api/v1/auth/login', data),
};

export default apiClient; 