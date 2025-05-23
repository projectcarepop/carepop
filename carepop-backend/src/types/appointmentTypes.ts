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