import { z } from 'zod';

// Schema for path parameters (providerId)
export const GetProviderAvailabilityPathParamsSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid Provider ID format" }),
});
export type GetProviderAvailabilityPathParams = z.infer<typeof GetProviderAvailabilityPathParamsSchema>;

// Schema for query parameters
export const GetProviderAvailabilityQuerySchema = z.object({
  clinicId: z.string().uuid({ message: "Invalid Clinic ID format" }), // Availability might be clinic-specific
  serviceId: z.string().uuid({ message: "Invalid Service ID format" }), // Used to determine service duration
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid startDate format, expected YYYY-MM-DD" }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid endDate format, expected YYYY-MM-DD" }),
  // Optional: preferredTimezone (IANA string, e.g., 'Asia/Manila') - for interpreting start/endDate and presenting slots
  // For MVP, we might assume a default timezone (e.g., UTC or server local) if not provided.
});
export type GetProviderAvailabilityQuery = z.infer<typeof GetProviderAvailabilityQuerySchema>;

// Structure for an individual availability slot
export interface AvailabilitySlot {
  startTime: string; // Full ISO 8601 DateTime string (e.g., "2024-09-15T09:00:00.000Z")
  endTime: string;   // Full ISO 8601 DateTime string (e.g., "2024-09-15T10:00:00.000Z")
}

// Structure for the API response
export interface ProviderAvailabilityResponseSlot {
  date: string; // YYYY-MM-DD
  slots: AvailabilitySlot[];
}

export type ProviderAvailabilityResponse = ProviderAvailabilityResponseSlot[];

// Internal types that might be useful for the service layer
export interface ProviderWorkingBlock {
  start: Date; // JS Date object (UTC)
  end: Date;   // JS Date object (UTC)
} 