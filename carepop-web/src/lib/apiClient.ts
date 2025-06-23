import axios from 'axios';
import { Clinic, Service, Provider } from '@/lib/types/booking';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

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

export const getBookingClinics = async (token: string): Promise<Clinic[]> => {
    const response = await apiClient.get('/booking/clinics', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getBookingServices = async (token: string, clinicId: string): Promise<Service[]> => {
    const response = await apiClient.get('/booking/services', {
        headers: { Authorization: `Bearer ${token}` },
        params: { clinicId },
    });
    return response.data;
};

export const getBookingProviders = async (token: string, clinicId: string, serviceId: string): Promise<Provider[]> => {
    const response = await apiClient.get('/providers', {
        headers: { Authorization: `Bearer ${token}` },
        params: { clinicId, serviceId },
    });
    return response.data;
};

export const getProviderAvailability = async (token: string, providerId: string, date: string): Promise<string[]> => {
    const response = await apiClient.get('/booking/availability', {
        headers: { Authorization: `Bearer ${token}` },
        params: { providerId, date },
    });
    return response.data;
};

export default apiClient; 