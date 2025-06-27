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
  let url = `${API_BASE_URL}/api/me/medical-records`;

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

// --- Admin Service (Requires Admin Role) ---
// The functions in this section are designed for both client-side and server-side usage.
// When calling from a server component, pass the access token directly.
// When calling from a client component, get the token from the session context.

export async function getAdminAppointments(accessToken: string, filters?: Record<string, string | number>) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  const queryParams = new URLSearchParams(filters as Record<string, string>);
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

export async function getPublicClinics() {
  const response = await fetch(`${API_BASE_URL}/api/public/clinics`);
  if (!response.ok) throw new Error("Failed to fetch clinics.");
  const result = await response.json();
  // This endpoint returns data in a 'data' property.
  return result.data || [];
}

export async function getPublicAvailability(params: { serviceId: string; clinicId: string; date: string; }) {
  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}/api/public/availability?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch availability.");
  const result = await response.json();
  // The backend for this specific endpoint returns an object with a 'slots' property.
  return result.slots || [];
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
  const supabase = createClient(cookieStore);

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

export async function cancelAppointment(appointmentId: string, accessToken: string) {
    const headers = await getAuthHeaders(accessToken);
    const url = `${API_BASE_URL}/api/me/appointments/${appointmentId}/cancel`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An unknown error occurred." }));
        throw new Error(error.message || "Failed to cancel appointment.");
    }

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