import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        // This is a placeholder for where you might get the token.
        // In a real app, this would come from your auth context or a secure store.
        // const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null;
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient; 