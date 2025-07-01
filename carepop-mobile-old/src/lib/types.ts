// This is a temporary workaround to remove the Drizzle dependency from the mobile client.
// Ideally, these types would be in a shared package.

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled_by_patient' | 'canceled_by_admin' | 'no_show';
export type MedicalRecordType = 'PRESCRIPTION' | 'CLINICAL_DOCUMENT' | 'DOCTOR_NOTE';
export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'canceled';
export type UserRole = 'patient' | 'admin';
export type DayOfWeek = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

export type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  middleInitial: string | null;
  email: string;
  role: UserRole;
  birthday: string | null;
  contactNo: string | null;
  street: string | null;
  provinceCode: string | null;
  cityMunicipalityCode: string | null;
  barangayCode: string | null;
  civilStatus: string | null;
  religion: string | null;
  occupation: string | null;
  philhealthNo: string | null;
  genderIdentity: string | null;
  pronouns: string | null;
  assignedSexAtBirth: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // ... add other profile fields as needed
};

export type UpdateProfilePayload = Partial<Omit<Profile, 'id' | 'email' | 'role' | 'createdAt' | 'updatedAt'>>;

/**
 * The exact payload shape required by the backend API for updating a user profile.
 * All keys are in snake_case.
 */
export type UpdateProfileApiPayload = {
  first_name?: string | null;
  last_name?: string | null;
  middle_initial?: string | null;
  birthday?: string | null;
  contact_no?: string | null;
  street?: string | null;
  province_code?: string | null;
  city_municipality_code?: string | null;
  barangay_code?: string | null;
  civil_status?: string | null;
  religion?: string | null;
  occupation?: string | null;
  philhealth_no?: string | null;
  gender_identity?: string | null;
  pronouns?: string | null;
  assigned_sex_at_birth?: string | null;
  avatar_url?: string | null;
};

export type Clinic = {
  id: string;
  name: string;
  address: any | null; // JSONB
  // ... add other clinic fields as needed
};

export type Doctor = {
  id: string;
  fullName: string;
  specialtyText: string | null;
  // ... add other doctor fields as needed
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string; // Numeric is string in JS
  durationMinutes: number;
  categoryId: string | null;
};

export type ServiceCategory = {
  id: string;
  name: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  clinicId: string;
  appointmentTime: string; // ISO String
  status: AppointmentStatus;
};

export type MedicalRecord = {
  id: string;
  appointmentId: string;
  recordType: MedicalRecordType;
  details: any; // JSONB
  createdAt: string; // ISO String
};

// This is a subset for creating a new appointment
export type NewAppointment = {
  patientId: string;
  doctorId: string;
  serviceId: string;
  clinicId: string;
  appointmentTime: string; // ISO String
};


// More specific types for API payloads and rich client-side objects
export type AppointmentWithRelations = Appointment & {
  clinic: Pick<Clinic, 'id' | 'name' | 'address'>;
  service: Pick<Service, 'id' | 'name' | 'price' | 'durationMinutes'>;
};

// This is the shape returned by the GET /api/me/records endpoint
export type MedicalRecordWithRelations = {
  id: string;
  recordType: MedicalRecordType;
  createdAt: string;
  appointment: {
    id: string;
    appointmentTime: string;
    doctor: Pick<Doctor, 'fullName'> | null;
    clinic: Pick<Clinic, 'name'> | null;
    service: Pick<Service, 'name'> | null;
  };
};

export type DetailedMedicalRecord = {
  recordId: string;
  recordType: MedicalRecordType;
  createdAt: string;
  appointment: {
    id: string;
    appointmentTime: string;
  };
  doctor: {
    fullName:string;
  };
  clinic: {
    name: string;
  };
  service: {
    name: string;
  };
  details: {
    // DOCTOR_NOTE
    note?: string;
    // PRESCRIPTION
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
    // DOCUMENT
    documentUrl?: string;
    documentName?: string;
  } | null;
};

export type DetailedAppointment = Appointment & {
  doctor: Pick<Doctor, 'id' | 'fullName' | 'specialtyText'>;
  clinic: Pick<Clinic, 'id' | 'name' | 'address'>;
  service: Pick<Service, 'id' | 'name' | 'price' | 'durationMinutes'>;
};

export type AvailabilitySlot = {
  doctorId: string;
  doctorName: string;
  avatarUrl?: string | null;
  specialtyText?: string | null;
  slots: string[];
};

// New type for the combined service and category data
export type ServiceWithCategory = Service & {
  serviceCategory: ServiceCategory | null;
};

export type AvailabilityResponse = {
  availableSlots: string[];
  doctorsForSlot: Record<string, string[]>;
};

// --- Health Buddy Types ---

export type HealthLog = {
  id: string;
  userId: string;
  mood: string | null;
  symptoms: string[] | null;
  notes: string | null;
  logDate: string; // "YYYY-MM-DD"
  createdAt: string;
};

export type CreateHealthLogPayload = Omit<HealthLog, 'id' | 'userId' | 'createdAt'>;

export type AIInsight = {
  insight: string;
};

// --- New Health Buddy Types ---

export type MenstrualLog = {
  id: string;
  userId: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  createdAt: string;
};

export type CreateMenstrualLogPayload = Omit<MenstrualLog, 'id' | 'userId' | 'createdAt'>;

export type HealthLogSummary = {
  frequentSymptoms: { symptom: string; count: number }[];
  // other summary data can be added here in the future
};