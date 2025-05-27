"use server";

import { z } from 'zod';

// Assuming the backend DTO matches this structure, or adjust as needed
export interface Provider {
  id: string;
  name: string;
  specialty_name: string | null;
  avatar_url: string | null;
  // Add any other fields returned by the backend and needed by the frontend
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Optional: Define a schema for validating input if needed, though for GET params it's simpler
const GetProvidersSchema = z.object({
  clinicId: z.string().uuid("Invalid Clinic ID format"),
  serviceId: z.string().uuid("Invalid Service ID format"), // Service ID is mandatory for this action based on usage context
});

export async function getProvidersAction(params: {
  clinicId: string;
  serviceId: string;
}): Promise<{ success: boolean; data?: Provider[]; message?: string }> {
  try {
    const validation = GetProvidersSchema.safeParse(params);
    if (!validation.success) {
      console.error('[getProvidersAction] Input validation error:', validation.error.format());
      // Construct a user-friendly error message from Zod's error object
      const formattedErrors = validation.error.flatten();
      const errorMessages = [
        ...formattedErrors.formErrors,
        ...Object.values(formattedErrors.fieldErrors).flat(),
      ].filter(Boolean);
      const message = `Invalid input parameters: ${errorMessages.join(', ')}`;
      return { success: false, message };
    }

    const { clinicId, serviceId } = validation.data;

    // Construct the URL. The backend's listProvidersForClinic uses clinicId as a path param
    // and serviceId as a query param.
    const fetchUrl = `${API_BASE_URL}/clinics/${clinicId}/providers?serviceId=${serviceId}`;
    console.log('[getProvidersAction] Fetching from URL:', fetchUrl); // Log the URL

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header here as provider listing is often public.
        // If auth is required by your backend for this endpoint, add getAuthToken() logic similar to appointments.ts
      },
      cache: 'no-store', // Or 'force-cache' or time-based revalidation as appropriate
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[getProvidersAction] API error ${response.status}:`, errorData);
      throw new Error(`Failed to fetch providers: ${errorData.message || response.statusText}`);
    }

    const providers = await response.json() as Provider[];
    return { success: true, data: providers };

  } catch (error) {
    console.error('[getProvidersAction] Fetching error:', error);
    if (error instanceof Error && error.message.startsWith('Failed to fetch providers:')) {
        return { success: false, message: error.message };
    }
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred while fetching providers.' };
  }
} 