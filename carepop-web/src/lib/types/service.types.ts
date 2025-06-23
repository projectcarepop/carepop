// Types related to services and service categories

/**
 * Represents a single service category (formerly specialization).
 * This should align with the data structure from the backend API.
 */
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

/**
 * Represents a single service provided by the platform.
 * This should align with the data structure from the backend API.
 */
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  durationMinutes: number | null;
  serviceCategoryId: string | null; // Corrected from specializationId
  isActive: boolean;
  // Optional: include relation data if the API provides it
  serviceCategory?: ServiceCategory | null;
} 