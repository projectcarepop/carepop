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
    get: async (endpoint: string, params?: Record<string, any>) => {
        const headers = await getHeaders();
        const url = new URL(`${API_URL}${endpoint}`);
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    },
    post: async (endpoint: string, body: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
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
    },
    delete: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            // DELETE may not return a body, so handle that case
            if (response.headers.get('content-type')?.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            } else {
                 throw new Error(`API request failed with status ${response.status}`);
            }
        }
        // DELETE might not have a body, so return a success indicator or the body if it exists
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json();
        }
        return { success: true };
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
    notes?: string | null;
    services: { name: string };
    clinics: { name: string; address_line_1: string; };
    providers: { first_name: string; last_name: string; };
    // This field is for the UI, created by combining date and time from the backend
    appointment_datetime: string; 
    updated_at: string;
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

// A generic function to fetch appointments, now with optional filters
const getAppointments = async (status: 'upcoming' | 'past', filters: Record<string, any> = {}): Promise<Appointment[]> => {
    const endpoint = status === 'upcoming' 
        ? 'appointments/my/future' 
        : 'appointments/my/past';

    // Basic query parameter serialization
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${endpoint}${queryParams ? `?${queryParams}` : ''}`;

    const { data, error } = await supabase.from('appointments').select(`
      *,
      clinic:clinics(*),
      provider:profiles(*),
      service:services(*)
    `).in('status', status === 'upcoming' ? ['confirmed', 'pending'] : ['completed', 'cancelled', 'no_show'])
     .order('appointment_datetime', { ascending: status === 'upcoming' });

    if (error) {
        console.error(`Error fetching ${status} appointments:`, error);
        throw new Error(`Failed to fetch ${status} appointments`);
    }

    // This is a temporary frontend filter until backend is updated.
    // In a real scenario, the `filters` object would be converted to query params
    // and sent to a backend that can handle them.
    if (filters.serviceId && Array.isArray(data)) {
        return data.filter(appt => appt.service_id === filters.serviceId);
    }
    
    return data || [];
};

// Specific functions now use the generic one
export const getUpcomingAppointments = async (filters: Record<string, any> = {}): Promise<Appointment[]> => {
    return getAppointments('upcoming', filters);
};

export const getPastAppointments = async (filters: Record<string, any> = {}): Promise<Appointment[]> => {
    return getAppointments('past', filters);
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

export const getDirections = async (
  origin: string,
  destination: string,
  mode: 'driving' | 'walking'
) => {
  try {
    const data = await api.post('/public/navigation/directions', {
      origin,
      destination,
      mode,
    });
    return data;
  } catch (err: any) {
    console.error('API call failed for getDirections:', err);
    // Re-throwing the error so the calling component can handle it (e.g., show a toast)
    throw err;
  }
}; 