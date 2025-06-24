export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  // Add other profile fields from your database schema as needed
  // e.g., dateOfBirth: string | null;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  // These names are joined in the backend API response
  serviceName: string;
  doctorName: string;
  clinicName: string;
}

export interface MedicalRecord {
    id: string;
    record_date: string;
    type: string; // e.g., "Lab Result", "Consultation Note"
    title: string;
    // This name is joined in the backend API response
    doctorName: string;
} 