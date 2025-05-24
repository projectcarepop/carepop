import { z } from 'zod';

// Zod schema for the appointment booking request body
export const BookAppointmentRequestSchema = z.object({
  clinicId: z.string().uuid({ message: "Invalid Clinic ID format" }),
  serviceId: z.string().uuid({ message: "Invalid Service ID format" }),
  providerId: z.string().uuid({ message: "Invalid Provider ID format" }).optional(),
  appointment_time: z.string().datetime({ message: "Invalid appointment time format, expected ISO 8601" }), // ISO 8601 format
  notes: z.string().max(1000, { message: "Notes must be 1000 characters or less" }).optional(),
});

// TypeScript type for the appointment booking request body
export type BookAppointmentRequest = z.infer<typeof BookAppointmentRequestSchema>;

// Enum for appointment status (align with DB schema if it uses an enum)
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED_USER = 'cancelled_user',
  CANCELLED_CLINIC = 'cancelled_clinic',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// Zod schema for AppointmentStatus enum
export const AppointmentStatusSchema = z.nativeEnum(AppointmentStatus);

// TypeScript type for an appointment object (response and DB representation)
export interface Appointment {
  id: string; // UUID, primary key
  user_id: string; // UUID, FK to users/profiles
  clinic_id: string; // UUID, FK to clinics
  service_id: string; // UUID, FK to services
  provider_id: string | null; // UUID, FK to providers (nullable)
  appointment_time: string; // ISO date string
  status: AppointmentStatus;
  notes: string | null; // Potentially encrypted
  cancellation_reason: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  // Add any other relevant fields, e.g., duration_minutes if derived/stored
}

// Zod schema for the appointment cancellation request path parameters
export const CancelAppointmentPathParamsSchema = z.object({
  appointmentId: z.string().uuid({ message: "Invalid Appointment ID format" }),
});

// Enum for who initiated the cancellation
export enum CancelledBy {
  USER = 'user',
  CLINIC = 'clinic',
}

// Zod schema for CancelledBy enum
export const CancelledBySchema = z.nativeEnum(CancelledBy);

// Zod schema for the appointment cancellation request body
export const CancelAppointmentRequestBodySchema = z.object({
  cancelledBy: CancelledBySchema,
  cancellationReason: z.string().min(1, { message: "Cancellation reason is required" }).max(500, { message: "Cancellation reason must be 500 characters or less" }),
});

// TypeScript type for the appointment cancellation request body
export type CancelAppointmentRequestBody = z.infer<typeof CancelAppointmentRequestBodySchema>;

// TypeScript type for the appointment cancellation request path parameters
export type CancelAppointmentPathParams = z.infer<typeof CancelAppointmentPathParamsSchema>;

// --- Types for Fetching User Appointments with Details (APP-USER-1) ---

// Basic details for a service (assuming these fields exist on a full Service type)
export const ServiceDetailsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(), // Or make non-optional if always present
  // Add other relevant service fields like category, duration_minutes if needed directly in the list
});
export type ServiceDetails = z.infer<typeof ServiceDetailsSchema>;

// Basic details for a clinic (assuming these fields exist on a full Clinic type)
export const ClinicDetailsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address_line1: z.string().nullable().optional(), // Example field
  city: z.string().nullable().optional(),          // Example field
  // Add other relevant clinic fields like phone_number, full_address if needed
});
export type ClinicDetails = z.infer<typeof ClinicDetailsSchema>;

// Basic details for a provider (assuming these fields exist on a full Provider type)
export const ProviderDetailsSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(), // Assuming a full_name field
  specialty: z.string().nullable().optional(),
  // Add other relevant provider fields like qualifications, avatar_url if needed
});
export type ProviderDetails = z.infer<typeof ProviderDetailsSchema>;

// Enriched appointment details for user-facing lists/views
export const UserAppointmentDetailsSchema = z.object({
  // Core Appointment fields (consider if all are needed or a subset)
  id: z.string().uuid(), 
  user_id: z.string().uuid(),
  appointment_time: z.string().datetime(),
  status: AppointmentStatusSchema,
  notes: z.string().nullable(), // Assuming notes might be decrypted for the user
  cancellation_reason: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  
  // Joined details
  service: ServiceDetailsSchema,
  clinic: ClinicDetailsSchema,
  provider: ProviderDetailsSchema.nullable(), // Provider can be null on an appointment
});
export type UserAppointmentDetails = z.infer<typeof UserAppointmentDetailsSchema>;

// Schema for the API response when fetching a list of user appointments
export const GetUserAppointmentsResponseSchema = z.array(UserAppointmentDetailsSchema);
export type GetUserAppointmentsResponse = z.infer<typeof GetUserAppointmentsResponseSchema>;

// Potential Query Parameters for fetching appointments (e.g., for pagination, filtering by status - though APP-USER-1 is for future appointments)
// For now, APP-USER-1 doesn't specify query params, but this is where they'd go.
// export const GetUserAppointmentsQuerySchema = z.object({
//   limit: z.number().int().positive().optional(),
//   offset: z.number().int().nonnegative().optional(),
//   status: AppointmentStatusSchema.optional(), // Could be used for past appointments later
// });
// export type GetUserAppointmentsQuery = z.infer<typeof GetUserAppointmentsQuerySchema>; 