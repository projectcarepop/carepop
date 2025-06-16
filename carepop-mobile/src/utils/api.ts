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

// --- Types ---

export interface Appointment {
    id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: 'confirmed' | 'pending_confirmation' | 'cancelled' | 'completed' | 'no_show';
    services: { name: string };
    clinics: { name: string; address_line_1: string; };
    providers: { first_name: string; last_name: string; };
    // This field is for the UI, created by combining date and time from the backend
    appointment_datetime: string; 
}

export interface MedicalRecord {
    id: string;
    user_id: string;
    record_type: string;
    description: string | null;
    storage_object_path: string;
    created_at: string;
}

export interface SignedUrlResponse {
    signedUrl: string;
}


// --- API Functions ---

// Helper to combine date and time into a full ISO string for easier processing in UI
const processAppointments = (appointments: any[]): Appointment[] => {
    return appointments.map(appt => ({
        ...appt,
        appointment_datetime: `${appt.appointment_date}T${appt.start_time}`
    }));
};

export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
    try {
        const data = await api.get('/appointments/my/upcoming');
        return processAppointments(data);
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw error;
    }
};

export const getPastAppointments = async (): Promise<Appointment[]> => {
    try {
        const data = await api.get('/appointments/my/past');
        return processAppointments(data);
    } catch (error) {
        console.error('Error fetching past appointments:', error);
        throw error;
    }
};

export const getMyRecords = async (): Promise<MedicalRecord[]> => {
    try {
        const data = await api.get('/medical-records/my');
        return data as MedicalRecord[];
    } catch (error) {
        console.error('Error fetching medical records:', error);
        throw error;
    }
};

export const getRecordSignedUrl = async (recordId: string): Promise<SignedUrlResponse> => {
    try {
        const data = await api.get(`/medical-records/my/${recordId}/signed-url`);
        return data as SignedUrlResponse;
    } catch (error) {
        console.error('Error fetching signed URL for record:', error);
        throw error;
    }
}; 