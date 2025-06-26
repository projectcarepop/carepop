import type { SupabaseClient } from '@supabase/supabase-js';
import { type Profile, type AppointmentBookingPayload } from '@/lib/types'; // Uses our stable, Drizzle-generated types
import { type ProfileFormData } from '@/lib/validation/profile-schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// The getAuthHeaders function now takes the authenticated client as an argument.
async function getAuthHeaders(supabase: SupabaseClient) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Auth Error: Could not get session.", sessionError);
  }
  if (!session) {
    console.error("Auth Error: No session found. User is likely logged out or session expired.");
  } else if (!session.access_token) {
    console.error("Auth Error: Session found, but access token is missing.");
  } else {
    // This log can be noisy, so let's comment it out for now.
    // console.log("Auth Success: Session and access token found.");
  }

  if (!session?.access_token) {
    throw new Error("User not authenticated.");
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

// --- Profile Service ---
export async function getMyProfile(supabase: SupabaseClient): Promise<Profile> {
  const headers = await getAuthHeaders(supabase);
  const response = await fetch(`${API_BASE_URL}/api/me/profile`, { headers });
  if (!response.ok) throw new Error("Failed to fetch profile.");
  return response.json();
}

export async function updateMyProfile(supabase: SupabaseClient, profileData: Partial<ProfileFormData>): Promise<Profile> {
  const headers = await getAuthHeaders(supabase);
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}/api/public/clinics/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;
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
export async function getMyAppointments(supabase: SupabaseClient, params?: { limit?: number }) {
  const headers = await getAuthHeaders(supabase);
  let url = `${API_BASE_URL}/api/me/appointments`;

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
        throw new Error(error.message || "Failed to fetch appointments.");
      } catch {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }
  }
  const result = await response.json();
  // The backend wraps the data in an 'appointments' property
  return result.appointments || [];
}

export async function getMyMedicalRecords(supabase: SupabaseClient, params?: { limit?: number }) {
  const headers = await getAuthHeaders(supabase);
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

export async function getAdminProducts(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/products`, { headers });
    if (!response.ok) throw new Error("Failed to fetch products.");
    const result = await response.json();
    return result.data;
}

export async function getAdminAppointments(supabase: SupabaseClient, filters: Record<string, string>) {
    const headers = await getAuthHeaders(supabase);
    const queryParams = new URLSearchParams(filters);
    const url = `${API_BASE_URL}/api/admin/appointments?${queryParams.toString()}`;

    const response = await fetch(url, { headers });
     if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch appointments.');
    }
    const result = await response.json();
    return result.data;
}

export async function getAdminClinics(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics`, { headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch clinics.');
    }
    const result = await response.json();
    return result.data;
}

export async function getAdminDoctors(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors`, { headers });
    if (!response.ok) throw new Error("Failed to fetch doctors.");
    return response.json();
}

export async function getAdminServiceCategories(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/service-categories`, { headers });
    if (!response.ok) throw new Error("Failed to fetch service categories.");
    return response.json();
}

export async function getAdminServices(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/services`, { headers });
    if (!response.ok) throw new Error("Failed to fetch services.");
    const result = await response.json();
    return result.data;
}

export async function upsertService(supabase: SupabaseClient, serviceData: any, serviceId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = serviceId ? `${API_BASE_URL}/api/admin/services/${serviceId}` : `${API_BASE_URL}/api/admin/services`;
    const method = serviceId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers, body: JSON.stringify(serviceData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} service.`);
    return response.json();
}

export async function upsertServiceCategory(supabase: SupabaseClient, categoryData: any, categoryId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = categoryId ? `${API_BASE_URL}/api/admin/service-categories/${categoryId}` : `${API_BASE_URL}/api/admin/service-categories`;
    const method = categoryId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    return response.json();
}

export async function upsertDoctor(supabase: SupabaseClient, data: { userId: string; serviceCategoryId: string; clinicIds: string[]; serviceIds: string[]; }, doctorId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = doctorId 
        ? `${API_BASE_URL}/api/admin/doctors/${doctorId}` 
        : `${API_BASE_URL}/api/admin/doctors`;
    
    // The backend expects a specific structure. Let's build it.
    const payload = {
        user_id: data.userId,
        service_category_id: data.serviceCategoryId,
        clinic_ids: data.clinicIds,
        service_ids: data.serviceIds
    };

    const response = await fetch(url, {
        method: 'POST', // Backend handles upsert logic via POST
        headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to save doctor." }));
        throw new Error(error.message);
    }
    return response.json();
}

export async function upsertClinic(supabase: SupabaseClient, clinicData: any, clinicId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = clinicId ? `${API_BASE_URL}/api/admin/clinics/${clinicId}` : `${API_BASE_URL}/api/admin/clinics`;
    const method = clinicId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(clinicData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} clinic.`);
    }
    return response.json();
}

export async function getAdminProductCategories(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/product-categories`, { headers });
    if (!response.ok) throw new Error("Failed to fetch product categories.");
    const result = await response.json();
    return result.data;
}

export async function upsertProduct(supabase: SupabaseClient, productData: any, productId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = productId ? `${API_BASE_URL}/api/admin/products/${productId}` : `${API_BASE_URL}/api/admin/products`;
    const method = productId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(productData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} product.`);
    }
    return response.json();
}

export async function upsertProductCategory(supabase: SupabaseClient, categoryData: any, categoryId?: string) {
    const headers = await getAuthHeaders(supabase);
    const url = categoryId ? `${API_BASE_URL}/api/admin/product-categories/${categoryId}` : `${API_BASE_URL}/api/admin/product-categories`;
    const method = categoryId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    }
    return response.json();
}

export async function updateStock(supabase: SupabaseClient, productId: string, quantity: number) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity })
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
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/public/available-dates?${queryParams.toString()}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch available dates.' }));
        throw new Error(error.message);
    }
    const result = await response.json();
    // This endpoint returns data in a 'data' property.
    return result.data || [];
}

// --- Authenticated Booking Endpoints ---

export async function createAppointment(supabase: SupabaseClient, payload: AppointmentBookingPayload) {
  const headers = await getAuthHeaders(supabase);
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

export async function getAdminUsers(supabase: SupabaseClient) {
    const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
    if (!response.ok) throw new Error("Failed to fetch users.");
    const result = await response.json();
    return result.data;
}

export async function updateUserRole(supabase: SupabaseClient, userId: string, role: 'admin' | 'patient') {
    const headers = await getAuthHeaders(supabase);
    const url = `${API_BASE_URL}/api/admin/users/${userId}/role`;
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error("Failed to update user role.");
    return response.json();
}

export async function addNoteToAppointment(supabase: SupabaseClient, appointmentId: string, note: string) {
    const headers = await getAuthHeaders(supabase);
    const url = `${API_BASE_URL}/api/admin/appointments/${appointmentId}/records`;
    const payload = {
        recordType: 'DOCTOR_NOTE',
        details: { content: note },
    };
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to add note.");
    return response.json();
}

export async function getAdminUsersByRole(supabase: SupabaseClient, role: 'doctor' | 'patient') {
     const headers = await getAuthHeaders(supabase);
    const response = await fetch(`${API_BASE_URL}/api/admin/users?role=${role}`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch users with role: ${role}.`);
    return response.json();
}

export async function cancelAppointment(supabase: SupabaseClient, appointmentId: string) {
  const headers = await getAuthHeaders(supabase);
  const response = await fetch(`${API_BASE_URL}/api/me/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An unknown error occurred." }));
    throw new Error(error.message || "Failed to cancel appointment.");
  }

  return response.json();
} 