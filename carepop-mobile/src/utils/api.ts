import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8080/api/v1';

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (session) {
        headers.append('Authorization', `Bearer ${session.access_token}`);
    }
    return headers;
};

const api = {
    get: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    },
    patch: async (endpoint: string, body: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    }
};

export default api; 