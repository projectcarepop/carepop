// carepop-web/src/lib/types/appointmentTypes.ts

// Originally from carepop-web/src/lib/actions/appointments.ts
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED_USER = 'cancelled_user',
  CANCELLED_CLINIC = 'cancelled_clinic',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export interface ServiceDetails {
  id: string;
  name: string;
  description?: string | null;
}

export interface ClinicDetails {
  id: string;
  name: string;
  address_line1?: string | null;
  city?: string | null;
}

export interface ProviderDetails {
  id: string;
  full_name: string;
  specialty?: string | null;
}

export interface UserAppointmentDetails {
  id: string;
  user_id: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  service: ServiceDetails;
  clinic: ClinicDetails;
  provider?: ProviderDetails | null;
} 