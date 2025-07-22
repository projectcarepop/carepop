import { type Profile, type AppointmentBookingPayload } from '@/lib/types'; // Uses our stable, Drizzle-generated types
import { type ProfileFormData } from '@/lib/validation/profile-schema';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import type { Clinic, Doctor } from "@/lib/types";
import { format } from 'date-fns';

// Temporary Type Definitions - TODO: Move to a dedicated types/bookings.ts file
export type ClinicOverride = {
    id: string;
    clinicId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string | null;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
};
export type DoctorSchedule = {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};
export type UpsertClinicOverridePayload = Omit<ClinicOverride, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>;
export type UpsertDoctorSchedulePayload = Omit<DoctorSchedule, 'id'>;

export type DoctorOverride = {
    id: string;
    startDateTime: string; // ISO String
    endDateTime: string; // ISO String
    isAvailable: boolean;
};
export type UpsertDoctorOverridePayload = Omit<DoctorOverride, 'id'>;

// Type definitions for method payloads
export type NewProductCategoryPayload = Omit<ProductCategory, 'id'>;
export type UpsertInventoryItemPayload = Partial<Omit<InventoryItem, 'id' | 'updatedAt' | 'clinicId'>>;

// Simple type for AdminUser until we have a more formal definition
export type AdminUser = {
  id: string;
  email?: string;
  role: 'admin' | 'patient' | 'manager'; // Added manager
  fullName?: string | null;
  // Potential fields from Supabase Auth or profiles table
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string;
  created_at?: string;
  lastSignIn?: string;
  last_sign_in_at?: string;
  emailConfirmed?: boolean;
  email_confirmed_at?: string;
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
export const API_BASE_URL = rawApiUrl;

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
  q?: string | null;
  serviceId?: string | null;
  userLocation?: {
    lat: number;
    lon: number;
  } | null;
}

export async function searchClinics(filters: ClinicSearchFilters) {
  const params = new URLSearchParams();
  if (filters.q) {
    params.append('q', filters.q);
  }
  if (filters.serviceId) {
    params.append('serviceId', filters.serviceId);
  }

  if (filters.userLocation) {
    params.append('lat', String(filters.userLocation.lat));
    params.append('lon', String(filters.userLocation.lon));
  }

  const url = `${API_BASE_URL}/api/public/search/clinics?${params.toString()}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}`}));
        throw new Error(error.message || `Failed to search clinics.`);
    }
    const result = await response.json();
    return result.data || [];
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

export async function downloadMedicalDocument(recordId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/me/records/${recordId}/download`;
    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to generate download link." }));
        throw new Error(error.message);
    }
    
    const data = await response.json();
    return data;
}

// --- Admin Service (Requires Admin/Manager Role) ---
// The functions in this section are designed for both client-side and server-side usage.
// When calling from a server component, pass the access token directly.
// When calling from a client component, get the token from the session context.

export async function getAdminAppointments(
  accessToken: string, 
  params: { 
    page?: number;
    limit?: number;
    clinicId?: string;
    patientName?: string;
    date_from?: string;
    date_to?: string;
  } = {}
) {
  const headers = await getAuthHeaders(accessToken);
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}/api/admin/appointments?${queryParams.toString()}`;
  const response = await fetch(url, { headers, cache: 'no-store' });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Failed to fetch appointments' }));
    throw new Error(errorBody.message);
  }

  return response.json();
}

export async function getDashboardMetrics(accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch('/api/admin/metrics', { headers }); // Uses the proxy route
    if (!response.ok) {
        // Propagate the status code in the error message
        throw new Error(`Failed to fetch dashboard metrics: ${response.status}`);
    }
    return response.json();
}

export async function getAppointmentDetails(appointmentId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP Error: ${response.statusText}` }));
        return { data: null, error: error.message };
    }
    const result = await response.json();
    return { data: result.data, error: null };
}

export async function adminCancelAppointment(appointmentId: string, reason: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(error.message || `Failed to cancel appointment`);
    }
    return response.json();
}

export async function getAdminClinics(accessToken: string, params?: { page?: number, limit?: number, q?: string }) {
  const headers = await getAuthHeaders(accessToken);
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.q) queryParams.append('q', params.q);
  
  const url = `${API_BASE_URL}/api/admin/clinics?${queryParams.toString()}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function getAdminClinicsList(accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch clinics list.' }));
        throw new Error(error.message);
    }
    const result = await response.json();
    return result.data || [];
}

export async function getAdminDoctors(
    accessToken: string, 
    params: { page?: number; limit?: number; clinicId?: string; q?: string } = {}
) {
    const headers = await getAuthHeaders(accessToken);
    const url = new URL(`${API_BASE_URL}/api/admin/doctors`);
    
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.clinicId && params.clinicId !== 'all') {
        url.searchParams.set('clinicId', params.clinicId);
    }
    if (params.q) url.searchParams.set('q', params.q);
    
    const response = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch doctors.' }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function getAdminServiceCategories(
    accessToken: string, 
    params: { page?: number; limit?: number; q?: string } = {}
) {
    const headers = await getAuthHeaders(accessToken);
    const url = new URL(`${API_BASE_URL}/api/admin/service-categories`);
    
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.q) url.searchParams.set('q', params.q);
    
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error("Failed to fetch service categories");
    return response.json();
}

export async function getAdminServices(
    accessToken: string, 
    params: { page?: number; limit?: number; q?: string } = {}
) {
    const headers = await getAuthHeaders(accessToken);
    const url = new URL(`${API_BASE_URL}/api/admin/services`);
    
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.q) url.searchParams.set('q', params.q);
    
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error("Failed to fetch services");
    return response.json();
}

export async function deleteService(serviceId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(error.message || `Failed to delete service`);
    }
    return response.json();
}

export async function upsertService(serviceData: any, accessToken: string, serviceId?: string) {
    const headers = await getAuthHeaders(accessToken);
    const method = serviceId ? 'PUT' : 'POST';
    const url = serviceId ? `${API_BASE_URL}/api/admin/services/${serviceId}` : `${API_BASE_URL}/api/admin/services`;
    const response = await fetch(url, { method, headers, body: JSON.stringify(serviceData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} service.`);
    return response.json();
}

export async function deleteServiceCategory(categoryId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/service-categories/${categoryId}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(error.message || `Failed to delete category`);
    }
    return response.json();
}

export async function upsertServiceCategory(categoryData: any, accessToken: string, categoryId?: string) {
    const headers = await getAuthHeaders(accessToken);
    const method = categoryId ? 'PUT' : 'POST';
    const url = categoryId ? `${API_BASE_URL}/api/admin/service-categories/${categoryId}` : `${API_BASE_URL}/api/admin/service-categories`;
    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    return response.json();
}

export async function upsertDoctor(
  doctorData: Partial<Doctor & { clinicIds?: string[] }>,
  accessToken: string,
  id?: string
) {
  const url = id ? `${API_BASE_URL}/api/admin/doctors/${id}` : `${API_BASE_URL}/api/admin/doctors`;
  const method = id ? 'PUT' : 'POST';
  
  const headers = await getAuthHeaders(accessToken);

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(doctorData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to save doctor.' }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function upsertClinic(clinicData: Partial<Clinic & { serviceIds?: string[] }>, accessToken: string, clinicId?: string) {
  const { serviceIds, ...clinicPayload } = clinicData;
  const url = clinicId ? `${API_BASE_URL}/api/admin/clinics/${clinicId}` : `${API_BASE_URL}/api/admin/clinics`;
  const method = clinicId ? 'PUT' : 'POST';
  const headers = await getAuthHeaders(accessToken);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(clinicPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Failed to save clinic details: ${response.statusText}`}));
      throw new Error(error.message);
    }

    const savedClinic = await response.json();
    const clinicIdForServices = clinicId || savedClinic.id;

    if (serviceIds && clinicIdForServices) {
      const assignServicesResponse = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicIdForServices}/services`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ serviceIds }),
      });

      if (!assignServicesResponse.ok) {
        const error = await assignServicesResponse.json().catch(() => ({ message: 'Failed to assign services to the clinic.'}));
        throw new Error(error.message);
      }
    }
    
    return savedClinic;

  } catch (error: any) {
    console.error("Error in upsertClinic:", error);
    throw error;
  }
}

// --- START: Inventory and Product Category Management ---
export async function getAdminProducts(accessToken: string): Promise<any> {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/inventory/products`, { headers, cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch all admin products');
    }
    return response.json();
}

export async function getProductCategories(
  accessToken: string,
  params?: { page?: number; limit?: number; q?: string }
): Promise<{data: ProductCategory[], pagination?: { totalPages: number, currentPage: number, totalCount: number }}> {
  const headers = await getAuthHeaders(accessToken);
  const url = new URL(`${API_BASE_URL}/api/admin/product-categories`);
  
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.q) url.searchParams.set('q', params.q);
  
  const response = await fetch(url.toString(), { headers, cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch product categories." }));
    throw new Error(error.message || "Failed to fetch product categories.");
  }
  const result = await response.json();
  
  // Ensure result has the expected structure
  if (!result || typeof result !== 'object') {
    return { data: [], pagination: { totalPages: 0, currentPage: 1, totalCount: 0 } };
  }
  
  // If the backend doesn't support pagination yet, wrap the response
  if (Array.isArray(result)) {
    return { data: result, pagination: { totalPages: 1, currentPage: 1, totalCount: result.length } };
  }
  
  // Ensure data is an array
  if (!Array.isArray(result.data)) {
    return { data: [], pagination: result.pagination || { totalPages: 0, currentPage: 1, totalCount: 0 } };
  }
  
  return result;
}
export const getAdminProductCategories = getProductCategories; // Alias for compatibility

export async function deleteProductCategory(categoryId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/product-categories/${categoryId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Failed to delete product category.` }));
    throw new Error(error.message || `Failed to delete category`);
  }
  return response.json();
}

export async function upsertProductCategory(categoryData: NewProductCategoryPayload, accessToken: string, categoryId?: string) {
  const method = categoryId ? 'PUT' : 'POST';
  const url = categoryId
    ? `${API_BASE_URL}/api/admin/product-categories/${categoryId}`
    : `${API_BASE_URL}/api/admin/product-categories`;

  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Failed to save product category.` }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function getInventoryForClinic(
  clinicId: string, 
  accessToken: string,
  filters?: { 
    lowStock?: boolean; 
    expiringSoon?: boolean; 
    q?: string; 
    page?: number; 
    limit?: number; 
  }
): Promise<{data: InventoryItem[], pagination?: { totalPages: number, currentPage: number, totalCount: number }}> {
    const headers = await getAuthHeaders(accessToken);
    
    const params = new URLSearchParams();
    if (filters?.lowStock) params.append('lowStock', 'true');
    if (filters?.expiringSoon) params.append('expiringSoon', 'true');
    if (filters?.q) params.append('q', filters.q);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/admin/clinics/${clinicId}/inventory${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch inventory' }));
        throw new Error(error.message || 'Failed to fetch inventory');
    }
    const result = await response.json();
    
    // Ensure result has the expected structure
    if (!result || typeof result !== 'object') {
        return { data: [], pagination: { totalPages: 0, currentPage: 1, totalCount: 0 } };
    }
    
    // If the backend doesn't support pagination yet, wrap the response
    if (Array.isArray(result)) {
        return { data: result, pagination: { totalPages: 1, currentPage: 1, totalCount: result.length } };
    }
    
    // Ensure data is an array
    if (!Array.isArray(result.data)) {
        return { data: [], pagination: result.pagination || { totalPages: 0, currentPage: 1, totalCount: 0 } };
    }
    
    return result;
}

export async function getInventoryStats(clinicId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const url = `${API_BASE_URL}/api/admin/clinics/${clinicId}/inventory/stats`;
  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch inventory stats." }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function upsertInventoryItem(
  clinicId: string, 
  itemData: UpsertInventoryItemPayload, 
  accessToken: string, 
  itemId?: string
) {
  const method = itemId ? 'PUT' : 'POST';
  const url = itemId
    ? `${API_BASE_URL}/api/admin/clinics/${clinicId}/inventory/${itemId}`
    : `${API_BASE_URL}/api/admin/clinics/${clinicId}/inventory`;

  const headers = await getAuthHeaders(accessToken);

  // For POST requests, we must include the clinicId in the body.
  const body = method === 'POST' 
    ? JSON.stringify({ ...itemData, clinicId })
    : JSON.stringify(itemData);

  const response = await fetch(url, {
    method,
    headers,
    body: body,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Failed to save inventory item.` }));
    throw new Error(error.message);
  }
  return response.json();
}
export const upsertProduct = upsertInventoryItem; // Alias for compatibility

export async function deleteInventoryItem(clinicId: string, itemId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}/inventory/${itemId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete inventory item.");
  return response.json();
}
export const deleteProduct = deleteInventoryItem; // Alias for compatibility

export async function getItemBatches(itemId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory-items/${itemId}/batches`, { headers, cache: 'no-store' });
  if (!response.ok) throw new Error("Failed to fetch item batches.");
  return response.json();
}

export async function addBatchToItem(itemId: string, batchData: { quantity: number; batchNumber?: string; expiryDate: string; }, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory-items/${itemId}/batches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(batchData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to add batch." }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function deleteItemBatch(batchId: string, accessToken: string) {
  const headers = await getAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/inventory-item-batches/${batchId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete item batch.");
  return response.json();
}

// --- END: Inventory and Product Category Management ---

export async function getPublicServiceCategories() {
    const url = `${API_BASE_URL}/api/public/service-categories`;
    const response = await fetch(url, { cache: 'no-store' }); // Use no-store for dynamic data
    if (!response.ok) {
        throw new Error('Failed to fetch service categories');
    }
    // The backend for this route returns the array directly.
    return response.json();
}

export async function getPublicServices(filters: { clinicId?: string, categoryId?: string, q?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.clinicId) params.append('clinicId', filters.clinicId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.q) params.append('q', filters.q);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/public/services${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    const result = await response.json();
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
    // Always return the full result object for consistency.
    // The calling components are responsible for selecting the .data property.
    return result;
}

/**
 * Gets the public details for a single clinic by its ID.
 * @param clinicId The UUID of the clinic.
 * @returns The detailed clinic object, including services offered.
 */
export const getClinicDetails = async (clinicId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/public/clinics/${clinicId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch clinic details');
    }
    return response.json();
}

// Alias for consistency with mobile app naming
export const getPublicClinicDetails = getClinicDetails;

/**
 * Gets all available time slots for a given doctor and service on a specific date.
 * @param doctorId The UUID of the doctor.
 * @param serviceId The UUID of the service.
 * @param clinicId The UUID of the clinic.
 * @param date The specific date to fetch slots for (YYYY-MM-DD).
 * @returns A list of available slot date-time strings.
 */
export const getAvailableSlots = async (
    doctorId: string, 
    serviceId: string, 
    clinicId: string, 
    date: string
) => {
    const response = await fetch(`${API_BASE_URL}/api/public/doctors/${doctorId}/available-slots?serviceId=${serviceId}&clinicId=${clinicId}&date=${date}`);
    if (!response.ok) {
        throw new Error('Failed to fetch available slots');
    }
    const data = await response.json();
    return data.data; // The backend wraps the array in a 'data' property
};

/**
 * Gets all days with available slots for a given doctor/service in a specific month.
 * @param doctorId The UUID of the doctor.
 * @param serviceId The UUID of the service.
 * @param clinicId The UUID of the clinic.
 * @param month The month to check (1-12).
 * @param year The year to check.
 * @returns A list of dates (YYYY-MM-DD) that have availability.
 */
export const getAvailableDays = async (
    doctorId: string, 
    serviceId: string, 
    clinicId: string, 
    month: number, 
    year: number
) => {
    const response = await fetch(`${API_BASE_URL}/api/public/doctors/${doctorId}/available-days?serviceId=${serviceId}&clinicId=${clinicId}&month=${month}&year=${year}`);
    if (!response.ok) {
        throw new Error('Failed to fetch available days');
    }
    const data = await response.json();
    return data.data;
};

export async function getProvidersByService(serviceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/public/services/${serviceId}/doctors`);
    if (!response.ok) throw new Error("Failed to fetch providers.");
    return response.json();
}

export async function getProvidersForService(serviceId: string, clinicId?: string) {
    const url = new URL(`${API_BASE_URL}/api/public/services/${serviceId}/providers`);
    if (clinicId) {
        url.searchParams.set('clinicId', clinicId);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch providers for service.");
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
        const error = await response.json().catch(() => ({ message: 'Failed to create appointment.' }));
        // Handle specific conflict error
        if (response.status === 409) {
            throw new Error(error.message || 'This time slot is no longer available. Please select another time.');
        }
        throw new Error(error.message || 'Failed to create appointment.');
    }
    return response.json();
}

// New function to validate slot availability before booking
export async function validateSlotAvailability(
    doctorId: string,
    serviceId: string,
    clinicId: string,
    appointmentTime: string,
    accessToken: string
): Promise<{ available: boolean; message?: string }> {
    try {
        const headers = await getAuthHeaders(accessToken);
        const response = await fetch(`${API_BASE_URL}/api/me/appointments/validate-slot`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                doctor_id: doctorId,
                service_id: serviceId,
                clinic_id: clinicId,
                appointment_time: appointmentTime,
            }),
        });

        if (!response.ok) {
            // If endpoint doesn't exist, fall back to checking available slots
            if (response.status === 404) {
                return await fallbackSlotValidation(doctorId, serviceId, clinicId, appointmentTime);
            }
            return { available: false, message: 'Unable to verify slot availability.' };
        }

        const result = await response.json();
        return result;
    } catch {
        // Fall back to checking available slots if API fails
        return await fallbackSlotValidation(doctorId, serviceId, clinicId, appointmentTime);
    }
}

// Fallback validation by checking if the slot still appears in available slots
async function fallbackSlotValidation(
    doctorId: string,
    serviceId: string,
    clinicId: string,
    appointmentTime: string
): Promise<{ available: boolean; message?: string }> {
    try {
        const appointmentDate = new Date(appointmentTime);
        const dateStr = format(appointmentDate, 'yyyy-MM-dd');
        
        const availableSlots = await getAvailableSlots(doctorId, serviceId, clinicId, dateStr);
        const isAvailable = availableSlots.includes(appointmentTime);
        
        return {
            available: isAvailable,
            message: isAvailable ? undefined : 'This time slot is no longer available.'
        };
    } catch {
        return { 
            available: false, 
            message: 'Unable to verify slot availability. Please try again.' 
        };
    }
}

export async function cancelMyAppointment(appointmentId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/me/appointments/${appointmentId}/cancel`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to cancel appointment.' }));
        throw new Error(error.message);
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

export async function getAdminDashboardMetrics(cookieStore: ReturnType<typeof cookies>) {
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
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-metrics`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}` }));
        console.error("API Error in getAdminDashboardMetrics:", errorBody);
        return { data: null, error: errorBody.message || 'Failed to fetch dashboard metrics' };
    }
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error: any) {
    console.error("Network or parsing error in getAdminDashboardMetrics:", error);
    return { data: null, error: "A network error occurred while fetching metrics." };
  }
}

export async function getAdminUsers(
    accessToken: string, 
    params: { page?: number; limit?: number; q?: string; role?: string } = {}
) {
    const headers = await getAuthHeaders(accessToken);
    const url = new URL(`${API_BASE_URL}/api/admin/users`);
    
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.q) url.searchParams.set('q', params.q);
    if (params.role) url.searchParams.set('role', params.role);
    
    console.log('[FRONTEND] Calling admin users API:', url.toString());
    
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch users.');
    }
    
    const result = await response.json();
    console.log('[FRONTEND] Admin users API response:', {
        dataLength: result.data?.length,
        sampleUser: result.data?.[0],
        fullResponse: result
    });
    
    return result;
}

export async function updateUserRole(
  { userId, role }: { userId: string; role: 'patient' | 'admin' | 'manager' }, // added manager
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

/* This function is deprecated. Use a soft-delete (deactivate) pattern instead.
export async function deleteClinic(clinicId: string, accessToken: string) {
  const headers = await getServerAuthHeaders(accessToken);
  const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(error.message);
  }

  return response.json();
}
*/

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

type NotePayload = { recordType: 'DOCTOR_NOTE'; details: { note: string } };
type PrescriptionPayload = { recordType: 'PRESCRIPTION'; details: { medication: string; dosage?: string; frequency?: string } };
type MedicalRecordPayload = NotePayload | PrescriptionPayload;

export async function addMedicalRecord(appointmentId: string, payload: MedicalRecordPayload, accessToken: string) {
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

// A new function specifically for uploading documents with multipart/form-data
export const uploadDocument = async (
    appointmentId: string, 
    documentName: string, 
    file: File, 
    token: string,
    prescriptionRecordId?: string
) => {
    const formData = new FormData();
    formData.append('documentName', documentName);
    formData.append('document', file);
    if (prescriptionRecordId) {
        formData.append('prescriptionRecordId', prescriptionRecordId);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}/documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is set automatically by the browser with FormData
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document.');
    }

    return response.json();
};

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
        method: 'PUT', // Changed from POST to PUT to match backend
        headers,
        body: JSON.stringify({ serviceIds })
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to assign services to clinic.');
    }
    return response.json();
}

// --- SERVER-SIDE SERVICE FUNCTIONS ---
// These accept the token directly, as they are called from Server Components or Route Handlers

const API_URL_SERVER = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getServerAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
}

export async function getMyProfileOnServer(accessToken: string): Promise<Profile> {
  const headers = await getServerAuthHeaders(accessToken);
  try {
    const response = await fetch(`${API_URL_SERVER}/api/me/profile`, { headers, cache: 'no-store' });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}` }));
      console.error("API Error in getMyProfileOnServer:", errorBody);
      throw new Error(errorBody.message);
    }
    return response.json();
  } catch (error) {
    console.error("Network or parsing error in getMyProfileOnServer:", error);
    throw new Error("A server-side network error occurred.");
  }
}

export async function getMyAppointmentsOnServer(accessToken: string) {
  const headers = await getServerAuthHeaders(accessToken);
  try {
    const response = await fetch(`${API_URL_SERVER}/api/me/appointments`, { headers, cache: 'no-store' });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Failed to fetch appointments.' }));
      throw new Error(errorBody.message);
    }
    const result = await response.json();
    return result.appointments || [];
  } catch (error) {
    console.error("Network or parsing error in getMyAppointmentsOnServer:", error);
    throw new Error("A server-side network error occurred while fetching appointments.");
  }
}

export async function getMyMedicalRecordsOnServer(accessToken: string) {
    const headers = await getServerAuthHeaders(accessToken);
    const response = await fetch(`${API_URL_SERVER}/api/me/records`, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch medical records." }));
        throw new Error(error.message);
    }
    const result = await response.json();
    return result.records || [];
}

export async function getClinicOverrides(clinicId: string, accessToken: string): Promise<ClinicOverride[]> {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/clinics/${clinicId}/overrides`;
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch clinic overrides." }));
        throw new Error(error.message);
    }
    const result = await response.json();
    return result.data;
}

export async function upsertClinicOverride(
    clinicId: string,
    overrideData: UpsertClinicOverridePayload,
    accessToken: string,
    overrideId?: string
) {
    const headers = await getAuthHeaders(accessToken);
    const url = overrideId 
        ? `${API_BASE_URL}/api/admin/overrides/${overrideId}`
        : `${API_BASE_URL}/api/admin/clinics/${clinicId}/overrides`;
    
    const method = overrideId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(overrideData),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Failed to ${method === 'POST' ? 'create' : 'update'} override.` }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function deleteClinicOverride(overrideId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/overrides/${overrideId}`;
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete override.' }));
        throw new Error(error.message);
    }
    return { success: true };
}

export async function getDoctorsByClinic(clinicId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/clinics/${clinicId}/doctors`;
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
            throw new Error(errorBody.message || "Failed to fetch doctors");
        }
        return await response.json();
    } catch (error) {
        console.error("Network or parsing error in getDoctorsByClinic:", error);
        throw error;
    }
}

export async function getDoctorSchedules(doctorId: string, accessToken: string): Promise<DoctorSchedule[]> {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/doctors/${doctorId}/schedules`;
    
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch schedules.' }));
        throw new Error(error.message);
    }
    const result = await response.json();
    return result.data;
}

export async function createDoctorSchedule(
    doctorId: string,
    scheduleData: UpsertDoctorSchedulePayload,
    accessToken: string
) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/doctors/${doctorId}/schedules`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create schedule.' }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function updateDoctorSchedule(
    scheduleId: string,
    scheduleData: Partial<UpsertDoctorSchedulePayload>,
    accessToken: string,
) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/schedules/${scheduleId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update schedule.' }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function deleteDoctorSchedule(scheduleId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/schedules/${scheduleId}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete schedule.' }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function getDoctorOverrides(doctorId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/doctors/${doctorId}/overrides`;
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch doctor overrides.' }));
        throw new Error(error.message);
    }
    const result = await response.json();
    return result;
}

export async function upsertDoctorOverride(
    doctorId: string,
    overrideData: UpsertDoctorOverridePayload,
    accessToken: string,
    overrideId?: string,
) {
    const headers = await getAuthHeaders(accessToken);
    const url = overrideId
        ? `${API_BASE_URL}/api/admin/doctor-overrides/${overrideId}`
        : `${API_BASE_URL}/api/admin/doctors/${doctorId}/overrides`;

    const method = overrideId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(overrideData),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to save doctor override.' }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function deleteDoctorOverride(overrideId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch(`${API_BASE_URL}/api/admin/overrides/${overrideId}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete doctor override' }));
        throw new Error(error.message);
    }
    return response.json();
}

// --- NEW Availability Calculation Function ---
export async function getCalculatedAvailability(
    doctorId: string, 
    startDate: string, 
    endDate: string, 
    accessToken: string
) {
    const headers = await getAuthHeaders(accessToken);
    const url = new URL(`${API_BASE_URL}/api/admin/doctors/${doctorId}/calculated-availability`);
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);

    try {
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
            throw new Error(errorBody.message || "Failed to fetch calculated availability");
        }
        return await response.json();
    } catch (error) {
        console.error("Network or parsing error in getCalculatedAvailability:", error);
        throw error;
    }
}

// Type definitions for the master schedule endpoint response
export type MasterScheduleAppointment = {
    id: string;
    appointmentTime: string;
    patient: { firstName: string | null; lastName: string | null };
    doctor: { fullName: string | null };
    service: { name: string; durationMinutes: number };
};

export type MasterScheduleData = {
    clinic_overrides: ClinicOverride[];
    doctor_schedules: DoctorSchedule[];
    doctor_overrides: DoctorOverride[];
    booked_appointments: MasterScheduleAppointment[];
};

export async function getClinicMasterSchedule(
    clinicId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string,   // YYYY-MM-DD
    accessToken: string
): Promise<MasterScheduleData> {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/admin/clinics/${clinicId}/master-schedule?start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch master schedule');
    }
    return response.json();
}

export async function getClinicManagementContext(clinicId: string, token: string) {
    const headers = await getAuthHeaders(token);
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}/management-context`, { 
        headers, 
        cache: 'no-store' 
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to fetch clinic management context." }));
        throw new Error(error.message);
    }
    return response.json();
}

// Remove the old updateClinicDoctorAssignments function and replace with new one
export async function updateClinicDoctorAssignments({ 
    clinicId, 
    assignments, 
    token 
}: { 
    clinicId: string, 
    assignments: { serviceId: string, doctorIds: string[] }[], 
    token: string 
}) {
    const headers = await getAuthHeaders(token);
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics/${clinicId}/doctor-assignments`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ assignments }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update doctor assignments.' }));
        throw new Error(error.message);
    }
    return response.json();
}