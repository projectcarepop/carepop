import Constants from 'expo-constants';
import { supabase } from './supabase';

// Get the backend URL from app.json for production builds
const MANIFEST_BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;

// This function automatically determines the correct API URL
function getApiUrl() {
  // __DEV__ is a global variable set by React Native, true in development mode
  if (__DEV__) {
    // In development, we need the IP address of the machine running the server.
    // Expo's 'hostUri' provides this. It looks like '192.168.1.15:8081'.
    const hostUri = Constants.expoConfig?.hostUri;
    // We only want the IP address part, not the port.
    const host = hostUri?.split(':')[0];
    // We construct the full URL with the backend port (3000)
    return `http://${host}:3000/api/v1`;
  } else {
    // In production (an EAS build), we use the official URL from app.json
    return MANIFEST_BACKEND_URL;
  }
}

const API_URL = getApiUrl();

if (!API_URL) {
  // This is a safeguard
  console.error(
    'CRITICAL: API_URL could not be determined. Check network or app.json config.'
  );
}

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (session) {
        headers.append('Authorization', `Bearer ${session.access_token}`);
    }
    return headers;
};

// THIS IS THE NEW CLERK AUTH HEADER FUNCTION.
// It takes a `getToken` function directly from the `useAuth` hook.
export const getClerkHeaders = async (getToken: () => Promise<string | null>) => {
    const token = await getToken();
    
    if (!token) {
        // This will happen if the user's session expires or if there's a network issue connecting to Clerk.
        // We throw a specific error here to prevent sending an unauthorized request to our backend.
        throw new Error('Authentication token could not be retrieved. Your session may have expired or there may be a network issue. Please try logging out and in again.');
    }

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    return headers;
};

const api = {
    get: async (endpoint: string, getToken: () => Promise<string | null>, params?: Record<string, any>) => {
        const headers = await getClerkHeaders(getToken);
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
            throw new Error(error.error || 'API request failed');
        }
        return response.json();
    },
    post: async (endpoint: string, body: any, getToken: () => Promise<string | null>) => {
        const headers = await getClerkHeaders(getToken);
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
    put: async (endpoint: string, body: any, getToken: () => Promise<string | null>) => {
        const headers = await getClerkHeaders(getToken);
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    },
    patch: async (endpoint: string, body: any, getToken: () => Promise<string | null>) => {
        const headers = await getClerkHeaders(getToken);
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
    delete: async (endpoint: string, getToken: () => Promise<string | null>) => {
        const headers = await getClerkHeaders(getToken);
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) {
            // DELETE may not return a body, so handle that case
            if (response.headers.get('content-type')?.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
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
const getAppointments = async (getToken: () => Promise<string | null>, status: 'upcoming' | 'past', filters: Record<string, any> = {}): Promise<Appointment[]> => {
    const endpoint = status === 'upcoming' 
        ? '/appointments/my/future' 
        : '/appointments/my/past';
    
    try {
        const data = await api.get(endpoint, getToken, filters);
        return processAppointments(data.appointments || []); // Assuming the API returns { appointments: [] }
    } catch (error) {
        console.error(`Error fetching ${status} appointments:`, error);
        throw new Error(`Failed to fetch ${status} appointments`);
    }
};

// Specific functions now use the generic one
export const getUpcomingAppointments = async (getToken: () => Promise<string | null>, filters: Record<string, any> = {}): Promise<Appointment[]> => {
    return getAppointments(getToken, 'upcoming', filters);
};

export const getPastAppointments = async (getToken: () => Promise<string | null>, filters: Record<string, any> = {}): Promise<Appointment[]> => {
    return getAppointments(getToken, 'past', filters);
};

export const getMyRecords = async (getToken: () => Promise<string | null>): Promise<MedicalRecord[]> => {
    try {
        const data = await api.get('/medical-records/my', getToken);
        return data as MedicalRecord[];
    } catch (error) {
        console.error('Error fetching medical records:', error);
        throw error;
    }
};

export const getRecordSignedUrl = async (getToken: () => Promise<string | null>, recordId: string): Promise<SignedUrlResponse> => {
    try {
        const data = await api.get(`/medical-records/my/${recordId}/signed-url`, getToken);
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