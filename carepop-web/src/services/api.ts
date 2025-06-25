import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Profile } from '@/lib/types'; // Uses our stable, Drizzle-generated types
import { type ProfileFormData } from '@/lib/validation/profile-schema';
import { type NewAppointment } from '@/lib/types';


const supabase = createClientComponentClient();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User is not authenticated.");
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

// --- Profile Service ---
export async function getMyProfile(): Promise<Profile> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/me/profile`, { headers });
  if (!response.ok) throw new Error("Failed to fetch profile.");
  return response.json();
}

export async function updateMyProfile(profileData: Partial<ProfileFormData>): Promise<Profile> {
  const headers = await getAuthHeaders();
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
    const response = await fetch(`${API_BASE_URL}/api/public/locations/provinces`);
    if (!response.ok) throw new Error("Failed to fetch provinces.");
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
export async function getMyAppointments(params?: { limit?: number }) {
  const headers = await getAuthHeaders();
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
  return result.data; // The backend wrapper returns data in a .data property
}

// --- Admin Service (Requires Admin Role) ---

export async function getAdminProducts() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/products`, { headers });
    if (!response.ok) throw new Error("Failed to fetch products.");
    const result = await response.json();
    return result.data;
}

export async function getAdminAppointments(filters: Record<string, string>) {
    const headers = await getAuthHeaders();
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

export async function getAdminClinics() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/clinics`, { headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || 'Failed to fetch clinics.');
    }
    const result = await response.json();
    return result.data;
}

export async function getAdminDoctors() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/doctors`, { headers });
    if (!response.ok) throw new Error("Failed to fetch doctors.");
    return response.json();
}

export async function getAdminServiceCategories() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/service-categories`, { headers });
    if (!response.ok) throw new Error("Failed to fetch service categories.");
    return response.json();
}

export async function getAdminServices() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/services`, { headers });
    if (!response.ok) throw new Error("Failed to fetch services.");
    const result = await response.json();
    return result.data;
}

export async function upsertService(serviceData: any, serviceId?: string) {
    const headers = await getAuthHeaders();
    const url = serviceId ? `${API_BASE_URL}/api/admin/services/${serviceId}` : `${API_BASE_URL}/api/admin/services`;
    const method = serviceId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers, body: JSON.stringify(serviceData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} service.`);
    return response.json();
}

export async function upsertServiceCategory(categoryData: any, categoryId?: string) {
    const headers = await getAuthHeaders();
    const url = categoryId ? `${API_BASE_URL}/api/admin/service-categories/${categoryId}` : `${API_BASE_URL}/api/admin/service-categories`;
    const method = categoryId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    return response.json();
}

export async function upsertDoctor(data: { userId: string; serviceCategoryId: string; clinicIds: string[]; serviceIds: string[]; }, doctorId?: string) {
    const headers = await getAuthHeaders();
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

export async function upsertClinic(clinicData: any, clinicId?: string) {
    const headers = await getAuthHeaders();
    const url = clinicId ? `${API_BASE_URL}/api/admin/clinics/${clinicId}` : `${API_BASE_URL}/api/admin/clinics`;
    const method = clinicId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(clinicData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} clinic.`);
    }
    return response.json();
}

export async function getAdminProductCategories() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/product-categories`, { headers });
    if (!response.ok) throw new Error("Failed to fetch product categories.");
    const result = await response.json();
    return result.data;
}

export async function upsertProduct(productData: any, productId?: string) {
    const headers = await getAuthHeaders();
    const url = productId ? `${API_BASE_URL}/api/admin/products/${productId}` : `${API_BASE_URL}/api/admin/products`;
    const method = productId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(productData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} product.`);
    }
    return response.json();
}

export async function upsertProductCategory(categoryData: any, categoryId?: string) {
    const headers = await getAuthHeaders();
    const url = categoryId ? `${API_BASE_URL}/api/admin/product-categories/${categoryId}` : `${API_BASE_URL}/api/admin/product-categories`;
    const method = categoryId ? 'PUT' : 'POST';

    const response = await fetch(url, { method, headers, body: JSON.stringify(categoryData) });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `Failed to ${method === 'POST' ? 'create' : 'update'} category.`);
    }
    return response.json();
}

export async function updateStock(productId: string, quantity: number) {
    const headers = await getAuthHeaders();
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

// --- Add other service functions here as needed, e.g., for appointments ---
export async function getPublicServices() {
    const response = await fetch(`${API_BASE_URL}/api/public/services`);
    if (!response.ok) throw new Error("Failed to fetch services.");
    return response.json();
}

export async function getPublicClinics(serviceId?: string) {
    let url = `${API_BASE_URL}/api/public/clinics`;
    if (serviceId) {
        url += `?serviceId=${serviceId}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch clinics.");
    return response.json();
}

export async function getPublicAvailability(params: { serviceId: string; clinicId: string; date: string; }) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/public/availability?${query}`);
    if (!response.ok) throw new Error("Failed to fetch availability.");
    return response.json();
}

export async function createAppointment(payload: NewAppointment) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/me/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        try {
            const error = await response.json();
            throw new Error(error.message || "Failed to create appointment.");
        } catch {
            throw new Error(`Failed to create appointment: ${response.statusText}`);
        }
    }
    return response.json();
}

export async function getAdminUsers() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
    if (!response.ok) throw new Error("Failed to fetch users.");
    const result = await response.json();
    return result.data;
}

export async function updateUserRole(userId: string, role: 'admin' | 'patient') {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/api/admin/users/${userId}/role`;
    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error("Failed to update user role.");
    return response.json();
}

export async function addNoteToAppointment(appointmentId: string, note: string) {
    const headers = await getAuthHeaders();
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

export async function getAdminUsersByRole(role: 'doctor' | 'patient') {
     const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users?role=${role}`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch users with role: ${role}.`);
    return response.json();
} 