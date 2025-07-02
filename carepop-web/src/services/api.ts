import { type Profile, type AppointmentBookingPayload } from '@/lib/types'; // Uses our stable, Drizzle-generated types
import { type ProfileFormData } from '@/lib/validation/profile-schema';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Simple type for AdminUser until we have a more formal definition
export type AdminUser = {
  id: string;
  email?: string;
  role: 'admin' | 'patient';
  fullName?: string | null;
  // Add other fields as necessary from your 'get_all_users_with_roles' RPC or profiles table
};

// Defensively construct the API base URL
let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// If the URL is set and doesn't start with http, prepend https://
if (rawApiUrl && !rawApiUrl.startsWith('http')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
// Remove trailing slash if it exists, to prevent double slashes in URLs
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}
const API_BASE_URL = rawApiUrl;

// It is intended for CLIENT-SIDE use only.
async function getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
}

// --- Profile Service ---
export async function getMyProfile(accessToken: string): Promise<Profile> {
  const headers = await getAuthHeaders(accessToken);
  try {
    const response = await fetch(`${API_BASE_URL}/api/me/profile`, { headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}` }));
      console.error("API Error in getMyProfile:", errorBody);
      throw new Error(errorBody.message);
    }
    return response.json();
  } catch (error) {
    console.error("Network or parsing error in getMyProfile:", error);
    throw new Error("A network error occurred. Please check your connection and try again.");
  }
}

export async function updateMyProfile(profileData: Partial<ProfileFormData>, accessToken: string): Promise<Profile> {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/me/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    try {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile.");
    } catch {
        throw new Error(`Failed to update profile: ${response.statusText}`);
    }
  }
  return response.json();
}

// --- Location Service (Public) ---
export async function getProvinces() {
  const response = await fetch('/data/psgc/provinces.json');
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  return response.json();
}

export async function getNearbyClinics(lat: number, lon: number, radius = 25000) {
  const url = `${API_BASE_URL}/api/public/clinics/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch nearby clinics: ${response.statusText}`);
  }
  return response.json();
}

export async function getCities(provinceCode: string) {
  const response = await fetch(`${API_BASE_URL}/api/public/locations/cities?provinceCode=${provinceCode}`);
  if (!response.ok) throw new Error("Failed to fetch cities.");
  return response.json();
}

export async function getBarangays(cityCode: string) {
    const response = await fetch(`${API_BASE_URL}/api/public/locations/barangays?cityCode=${cityCode}`);
    if (!response.ok) throw new Error("Failed to fetch barangays.");
    return response.json();
}

// --- NEW UNIFIED CLINIC SEARCH ---
interface ClinicSearchFilters {
  serviceId?: string | null;
  userLocation?: {
    lat: number;
    lon: number;
    radius?: number;
  } | null;
}

export async function searchClinics(filters: ClinicSearchFilters) {
  const params = new URLSearchParams();
  if (filters.serviceId) {
    params.append('serviceId', filters.serviceId);
  }

  // Determine the correct endpoint based on whether location is provided.
  const endpoint = filters.userLocation
    ? '/api/public/clinics/nearby'
    : '/api/public/clinics';

  if (filters.userLocation) {
    params.append('lat', String(filters.userLocation.lat));
    params.append('lon', String(filters.userLocation.lon));
    if (filters.userLocation.radius) {
        params.append('radius', String(filters.userLocation.radius));
    }
  }

  const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}`}));
        throw new Error(error.message || `Failed to search for clinics.`);
    }
    const result = await response.json();
    
    // Adapt to inconsistent API response shapes, just like the mobile app.
    const clinics = result.data || result;

    // Standardize the location object, as the 'nearby' endpoint returns a different format.
    return clinics.map((clinic: any) => ({
        ...clinic,
        latitude: clinic.latitude ?? parseFloat(clinic.location?.split(' ')[1].slice(1)),
        longitude: clinic.longitude ?? parseFloat(clinic.location?.split(' ')[0].slice(6)),
    }));

  } catch(error) {
    console.error("Network or parsing error in searchClinics:", error);
    throw new Error("A network error occurred while searching for clinics.");
  }
}

// --- Appointment Service ---
export async function getMyAppointments(accessToken: string, params?: { limit?: number }) {
  const headers = await getAuthHeaders(accessToken);
  let url = `${API_BASE_URL}/api/me/appointments`;

  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', String(params.limit));
  }
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch appointments.");
        } catch {
          throw new Error(`Failed to fetch appointments: ${response.statusText}`);
        }
    }
    const result = await response.json();
    // The backend wraps the data in an 'appointments' property
    return result.appointments || [];
  } catch (error) {
    console.error("Network or parsing error in getMyAppointments:", error);
    throw new Error("A network error occurred while fetching appointments.");
  }
}

export async function getMyMedicalRecords(accessToken: string, params?: { limit?: number }) {
  const headers = await getAuthHeaders(accessToken);
  let url = `${API_BASE_URL}/api/me/records`;

  const queryParams = new URLSearchParams();
  if (params?.limit) {
    queryParams.append('limit', String(params.limit));
  }
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch medical records.");
      } catch {
        throw new Error(`Failed to fetch medical records: ${response.statusText}`);
      }
  }
  const result = await response.json();
  // This endpoint returns the array in a 'records' property
  return result.records || [];
}

export async function getMyEnrichedRecords(accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/me/records`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch medical records." }));
        throw new Error(error.message);
    }
    const result = await response.json();
    // The backend returns { records: [...] }, so we return the full object.
    return result.records || [];
}

export async function getSingleMedicalRecord(recordId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/me/records/${recordId}`;
    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) {
        if (response.status === 404) {
            return null; // Return null if not found, allowing the page to handle it gracefully.
        }
        const error = await response.json().catch(() => ({ message: "Failed to fetch medical record." }));
        throw new Error(error.message);
    }
    return response.json();
}

// --- Admin Service (Requires Admin Role) ---
// The functions in this section are designed for both client-side and server-side usage.
// When calling from a server component, pass the access token directly.
// When calling from a client component, get the token from the session context.

export async function getAdminAppointments(accessToken: string, filters?: Record<string, any>) {
  // Make sure filters are string-based for URLSearchParams
  const stringFilters: Record<string, string> = {};
  if (filters) {
    Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
            stringFilters[key] = String(filters[key]);
        }
    });
  }

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  const queryParams = new URLSearchParams(stringFilters);
  const url = `${API_BASE_URL}/api/admin/appointments?${queryParams.toString()}`;

  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message || 'Failed to fetch appointments.');
  }
  const result = await response.json();
  // FIX: The backend returns data nested under a 'data' property.
  return result.data || [];
}

export async function getAppointmentDetails(appointmentId: string, accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  const url = `${API_BASE_URL}/api/admin/appointments/${appointmentId}`;

  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message || `Failed to fetch details for appointment ${appointmentId}.`);
  }
  const result = await response.json();
  return result.data; // The backend wraps this response in a 'data' property
}

export async function getAdminProducts(accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/products`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch products.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function getAdminClinics(accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch clinics.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function getAdminDoctors(accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch doctors.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function getAdminServiceCategories(accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/service-categories`, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error("Failed to fetch service categories.");
    const result = await response.json();
    return result.data || [];
}

export async function getAdminServices(accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/services`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch services.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function deleteService(serviceId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/services/${serviceId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'Failed to delete service.');
  }
  return response.json();
}

export async function upsertService(serviceData: any, accessToken: string, serviceId?: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const method = serviceId ? 'PUT' : 'POST';
    const url = serviceId ? `${API_BASE_URL}/api/admin/services/${serviceId}` : `${API_BASE_URL}/api/admin/services`;
    const response = await fetch(url, { method, headers, body: JSON.stringify(serviceData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} service.`);
    return response.json();
}

export async function deleteServiceCategory(categoryId: string, accessToken:string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/service-categories/${categoryId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'Failed to delete service category.');
  }
  return response.json();
}

export async function upsertServiceCategory(categoryData: any, accessToken: string, categoryId?: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const method = categoryId ? 'PUT' : 'POST';
    const url = categoryId ? `${API_BASE_URL}/api/admin/service-categories/${categoryId}` : `${API_BASE_URL}/api/admin/service-categories`;
    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    return response.json();
}

export async function upsertDoctor(data: { userId: string; serviceCategoryId: string; clinicIds: string[]; serviceIds: string[]; }, accessToken: string, doctorId?: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const method = doctorId ? 'PUT' : 'POST';
    const url = doctorId ? `${API_BASE_URL}/api/admin/doctors/${doctorId}` : `${API_BASE_URL}/api/admin/doctors`;
    const response = await fetch(url, { 
       method, 
       headers, 
       body: JSON.stringify(data) 
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to save doctor." }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function upsertClinic(clinicData: any, accessToken: string, clinicId?: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = clinicId ? `${API_BASE_URL}/api/admin/clinics/${clinicId}` : `${API_BASE_URL}/api/admin/clinics`;
    const method = clinicId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(clinicData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} clinic.`);
    }
    return response.json();
}

export async function getAdminProductCategories(accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/product-categories`, { headers });
    if (!response.ok) throw new Error("Failed to fetch product categories.");
    const result = await response.json();
    return result.data;
}

export async function upsertProduct(productData: any, accessToken: string, productId?: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = productId ? `${API_BASE_URL}/api/admin/products/${productId}` : `${API_BASE_URL}/api/admin/products`;
    const method = productId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(productData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} product.`);
    }
    return response.json();
}

export async function upsertProductCategory(categoryData: any, accessToken: string, categoryId?: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = categoryId ? `${API_BASE_URL}/api/admin/product-categories/${categoryId}` : `${API_BASE_URL}/api/admin/product-categories`;
    const method = categoryId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    }
    return response.json();
}

export async function updateStock(productId: string, quantity: number, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/inventory/${productId}`;
    const payload = { quantityOnHand: quantity };
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to update stock.');
    }
    return response.json();
}

// --- Public Booking Services ---

export async function getPublicServiceCategories() {
  const res = await fetch(`${API_BASE_URL}/api/public/service-categories`);
  if (!res.ok) throw new Error('Failed to fetch service categories');
  return res.json();
}

export async function getPublicServices(clinicId?: string) {
  let url = `${API_BASE_URL}/api/public/services`;
  if (clinicId) {
    url += `?clinicId=${clinicId}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch services.");
  const result = await response.json();
  // This endpoint returns data in a 'data' property.
  return result.data || [];
}

export async function getPublicClinics(serviceId?: string) {
  let url = `${API_BASE_URL}/api/public/clinics`;
  if (serviceId) {
    url += `?serviceId=${serviceId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch clinics');
  }
  const result = await response.json();
  // The backend nests the array in a 'data' property.
  return result.data || [];
}

export async function getPublicClinicDetails(clinicId: string) {
  const url = `${API_BASE_URL}/api/public/clinics/${clinicId}`;
  const response = await fetch(url, { cache: 'no-store' }); // No cache for fresh data
  if (!response.ok) {
    if (response.status === 404) {
      return null; // Return null if not found, for the server component to handle
    }
    const error = await response.json().catch(() => ({ message: `An error occurred fetching clinic details.` }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function getClinicDetails(clinicId: string) {
  const url = `${API_BASE_URL}/api/public/clinics/${clinicId}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Clinic not found.` }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function getPublicAvailability(params: { serviceId: string; clinicId: string; date: string; }) {
  const { serviceId, clinicId, date } = params;
  const url = `${API_BASE_URL}/api/public/availability?serviceId=${serviceId}&clinicId=${clinicId}&date=${date}`;
  const response = await fetch(url);
  const responseText = await response.text(); // Get response as text first
  console.log(`[API Service] Raw response for availability:`, responseText); // LOG IT
  if (!response.ok) throw new Error("Failed to fetch availability.");
  return JSON.parse(responseText); // Now parse it
}

export async function getPublicAvailableDates(params: { clinicId: string; serviceId: string; }) {
    const url = `${API_BASE_URL}/api/public/availability/dates?clinicId=${params.clinicId}&serviceId=${params.serviceId}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch available dates.');
    }
    return response.json();
}

export async function getProvidersForService(serviceId: string) {
    const url = `${API_BASE_URL}/api/public/services/${serviceId}/providers`;
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Failed to fetch providers for service ${serviceId}` }));
        throw new Error(error.message);
    }
    return response.json();
}

// --- Authenticated Booking Endpoints ---

export async function createAppointment(payload: AppointmentBookingPayload, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/me/appointments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An unknown error occurred while booking." }));
    throw new Error(error.message || "Failed to create appointment.");
  }

  return response.json();
}

export async function getAdminStats(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient(await cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { data: null, error: 'Not Authenticated' };
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
    
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}` }));
        console.error("API Error in getAdminStats:", errorBody);
        return { data: null, error: errorBody.message || 'Failed to fetch admin stats' };
    }
    const result = await response.json();
    // The backend nests the stats inside a 'data' property
    return { data: result.data, error: null };
  } catch (error: any) {
    console.error("Network or parsing error in getAdminStats:", error);
    return { data: null, error: "A network error occurred. Please check your connection and try again." };
  }
}

export async function getAdminUsers(accessToken: string): Promise<AdminUser[]> {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch users.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function updateUserRole(
  { userId, role }: { userId: string; role: 'patient' | 'admin' },
  accessToken: string
) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role })
    });

    if (response.ok) {
        return response.json();
    } else {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to update user role.');
    }
}

export async function getAdminUsersByRole(role: 'doctor' | 'patient', accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/users?role=${role}`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch users with role: ${role}.`);
    return response.json();
}

/**
 * Cancels an appointment. Throws an error on failure to properly integrate with tanstack-query.
 * This function is intended to be called with a valid access token.
 */
export async function cancelAppointment(appointmentId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/me/appointments/${appointmentId}/cancel`;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers,
    });

    if (!response.ok) {
        // This is the key change. By throwing an error, we allow useMutation's onError to catch it.
        const error = await response.json().catch(() => ({ message: "An unknown error occurred." }));
        throw new Error(error.message || "Failed to cancel appointment.");
    }

    // On success, we just return the JSON data.
    return response.json();
}

export async function deleteClinic(clinicId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(error.message || `Failed to delete clinic`);
    }
    // The backend now returns a JSON object. We must parse it.
    return response.json();
}

export async function deleteDoctor(doctorId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/doctors/${doctorId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'Failed to delete doctor.');
  }
  return response.json();
}

export async function deleteProduct(productId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to delete product.');
    }
    return response.json();
}

export async function deleteProductCategory(categoryId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/product-categories/${categoryId}`, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to delete product category.');
    }
    return response.json();
}

export async function addMedicalRecord(appointmentId: string, payload: { recordType: string; details: { note: string } }, accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  const url = `${API_BASE_URL}/api/admin/appointments/${appointmentId}/records`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `Failed to add medical record.`);
  }
  const result = await response.json();
  return result.data;
}

export async function uploadDocument(appointmentId: string, documentName: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentName', documentName);

    const response = await fetch(`${API_BASE_URL}/api/me/appointments/${appointmentId}/documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is set automatically by the browser with FormData
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}`}));
        throw new Error(error.message || 'Failed to upload document.');
    }

    return response.json();
}

export async function getAdminClinicServices(clinicId: string, accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}/services`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch assigned services.');
    }
    const result = await response.json();
    return result.data || [];
}

export async function assignServicesToClinic(clinicId: string, serviceIds: string[], accessToken: string) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}/services`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ serviceIds })
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to assign services to clinic.');
    }
    return response.json();
}