'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Clinic, BackendClinicData } from '@/app/admin/clinics/components/ClinicTable';
import { Database } from '../types/supabase';

export async function getClinicsForAdmin(): Promise<Clinic[]> {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (e) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  );
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error(sessionError?.message || 'User not authenticated.');
  }

  const token = session.access_token;
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured.');
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/admin/clinics`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    // Use 'no-store' to ensure fresh data is fetched every time, crucial for admin panels.
    cache: 'no-store', 
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized: Access token might be invalid or expired.');
    if (response.status === 403) throw new Error('Forbidden: You do not have permission to access this resource.');
    throw new Error(`Failed to fetch clinics: ${response.statusText} (Status: ${response.status})`);
  }

  const result = await response.json();

  // Transform snake_case from backend to camelCase for frontend
  const transformedData: Clinic[] = (result.data || []).map((clinic: BackendClinicData) => ({
    id: clinic.id,
    name: clinic.name,
    fullAddress: clinic.full_address,
    streetAddress: clinic.street_address,
    locality: clinic.locality,
    region: clinic.region,
    postalCode: clinic.postal_code,
    countryCode: clinic.country_code,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    contactPhone: clinic.contact_phone,
    contactEmail: clinic.contact_email,
    websiteUrl: clinic.website_url,
    operatingHours: clinic.operating_hours,
    servicesOffered: clinic.services_offered,
    fpopChapterAffiliation: clinic.fpop_chapter_affiliation,
    additionalNotes: clinic.additional_notes,
    isActive: clinic.is_active,
    createdAt: clinic.created_at,
    updatedAt: clinic.updated_at,
  }));

  return transformedData;
} 