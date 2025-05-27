"use server";

import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Schema for input validation
const GetAvailabilitySchema = z.object({
  clinicId: z.string().uuid("Invalid Clinic ID format"),
  serviceId: z.string().uuid("Invalid Service ID format"),
  providerId: z.string().uuid("Invalid Provider ID format").nullable(), // Provider ID can be null initially
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
});

export interface AvailabilitySlot {
  start_time: string; // e.g., "09:00:00"
  end_time: string;   // e.g., "09:30:00"
  // Potentially other details like capacity if relevant
}

export async function getAvailabilityAction(params: {
  clinicId: string;
  serviceId: string;
  providerId: string | null;
  date: string; // YYYY-MM-DD
}): Promise<{ success: boolean; data?: AvailabilitySlot[]; message?: string }> {
  try {
    const validation = GetAvailabilitySchema.safeParse(params);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten();
      const errorMessages = [
        ...formattedErrors.formErrors,
        ...Object.values(formattedErrors.fieldErrors).flat(),
      ].filter(Boolean);
      const message = `Invalid input parameters for availability: ${errorMessages.join(', ')}`;
      console.error('[getAvailabilityAction] Input validation error:', validation.error.format());
      return { success: false, message };
    }

    const { clinicId, serviceId, providerId, date } = validation.data;

    if (!providerId) {
      // CURRENT LIMITATION: Backend does not yet support fetching general availability 
      // for a service at a clinic without a specific provider.
      // This path needs a new backend endpoint or modification of the existing one.
      console.warn('[getAvailabilityAction] Attempted to fetch availability without providerId. This is not yet supported by the backend.');
      return { 
        success: false, 
        message: 'Fetching general availability without a specific provider is not yet supported. Please select a provider if required by the service.' 
      };
      // Alternatively, could return { success: true, data: [] } if we want to show no slots silently
    }

    // Construct the URL for provider-specific availability
    const response = await fetch(
      `${API_BASE_URL}/providers/${providerId}/availability?clinicId=${clinicId}&serviceId=${serviceId}&date=${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Auth header if this endpoint becomes protected
        },
        cache: 'no-store', // Availability should be fresh
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[getAvailabilityAction] API error ${response.status}:`, errorData);
      // Provide a more specific error if possible, e.g., from errorData.message
      const errorMessage = errorData.message || `Failed to fetch availability: ${response.statusText}`;
      return { success: false, message: errorMessage };
    }

    const availabilitySlots = await response.json() as AvailabilitySlot[]; // Assuming backend returns { availableSlots: [] }
    // If backend returns { availableSlots: [] }, then: const { availableSlots } = await response.json();
    // And then check if availableSlots is an array.
    // For now, assuming direct array of slots as per AvailabilitySlot[] type.
    
    // Ensure the response structure matches: If it's { availableSlots: [...] }, adapt this.
    // Let's assume the controller directly returns an array of slots matching AvailabilitySlot[]
    if (!Array.isArray(availabilitySlots)) {
        console.error('[getAvailabilityAction] API response is not an array:', availabilitySlots);
        return { success: false, message: 'Unexpected response format from availability API.' };
    }

    return { success: true, data: availabilitySlots };

  } catch (error) {
    console.error('[getAvailabilityAction] Fetching error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred while fetching availability.' };
  }
} 