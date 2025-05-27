// Corresponds to data from: Backend Integration Guide - Section 1.1
export interface Clinic {
  id: string;
  name: string;
  address: string;
}

// Corresponds to data from: Backend Integration Guide - Section 1.2
export interface Service {
  id: string;
  name: string;
  description: string;
  typicalDurationMinutes: number;
  requiresProviderAssignment: boolean;
  // clinicSpecificPrice?: number; // If added later
}

export interface ServiceCategory {
  category: string;
  services: Service[];
}

// Corresponds to data from: Backend Integration Guide - Section 2.1
export interface Provider {
  id: string;
  fullName: string;
  specialty: string;
  photoUrl?: string;
  acceptingNewPatients: boolean;
}

// Corresponds to data from: Backend Integration Guide - Section 3.1
export interface AvailabilitySlot {
  slotId: string; // Or a unique identifier like a timestamp
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
}

// For the context state
export interface BookingState {
  currentStep: number;
  
  // Step 1 Data
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  servicesForClinic: ServiceCategory[];
  selectedService: Service | null;
  
  // Step 2 Data
  providersForService: Provider[];
  selectedProvider: Provider | null;
  
  // Step 3 Data
  availabilitySlots: AvailabilitySlot[];
  selectedDate: Date | null; // Or string, if preferred for consistency
  selectedTimeSlot: AvailabilitySlot | null;
  
  // Step 4 Data
  bookingNotes: string;
  bookingConfirmation: BookingConfirmationData | null;

  // Loading and Error States
  isLoading: {
    clinics: boolean;
    servicesForClinic: boolean;
    providersForService: boolean;
    availabilitySlots: boolean;
    bookingSubmission: boolean;
  };
  errors: {
    clinics: string | null;
    servicesForClinic: string | null;
    providersForService: string | null;
    availabilitySlots: string | null;
    bookingSubmission: string | null;
  };
}

// For POST /api/appointments response - Backend Integration Guide - Section 4.1
export interface BookingConfirmationData {
  appointmentId: string;
  status: string;
  clinicName: string;
  serviceName: string;
  providerName: string;
  startTime: string;
}

export type BookingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_CLINICS_LOADING'; payload: boolean }
  | { type: 'SET_CLINICS_SUCCESS'; payload: Clinic[] }
  | { type: 'SET_CLINICS_ERROR'; payload: string | null }
  | { type: 'SELECT_CLINIC'; payload: Clinic | null }
  | { type: 'SET_SERVICES_FOR_CLINIC_LOADING'; payload: boolean }
  | { type: 'SET_SERVICES_FOR_CLINIC_SUCCESS'; payload: ServiceCategory[] }
  | { type: 'SET_SERVICES_FOR_CLINIC_ERROR'; payload: string | null }
  | { type: 'SELECT_SERVICE'; payload: Service | null }
  | { type: 'SET_PROVIDERS_LOADING'; payload: boolean }
  | { type: 'SET_PROVIDERS_SUCCESS'; payload: Provider[] }
  | { type: 'SET_PROVIDERS_ERROR'; payload: string | null }
  | { type: 'SELECT_PROVIDER'; payload: Provider | null }
  | { type: 'SET_AVAILABILITY_LOADING'; payload: boolean }
  | { type: 'SET_AVAILABILITY_SUCCESS'; payload: AvailabilitySlot[] }
  | { type: 'SET_AVAILABILITY_ERROR'; payload: string | null }
  | { type: 'SELECT_DATE'; payload: Date | null }
  | { type: 'SELECT_TIME_SLOT'; payload: AvailabilitySlot | null }
  | { type: 'SET_BOOKING_NOTES'; payload: string }
  | { type: 'SET_BOOKING_SUBMISSION_LOADING'; payload: boolean }
  | { type: 'SET_BOOKING_SUBMISSION_SUCCESS'; payload: BookingConfirmationData | null }
  | { type: 'SET_BOOKING_SUBMISSION_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING_STATE' }; 