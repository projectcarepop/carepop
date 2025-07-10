import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { z } from "zod";
import { type Database } from '../types/supabase';

// =================================================================
// ENUMS
// =================================================================
export const appointmentStatusEnum = schema.appointmentStatus.enumValues;
export const medicalRecordTypeEnum = schema.medicalRecordType.enumValues;
export const orderStatusEnum = schema.orderStatus.enumValues;
export const userRoleEnum = schema.userRole.enumValues;

// =================================================================
// PROFILES & USERS
// =================================================================
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type NewProfile = InferInsertModel<typeof schema.profiles>;

// =================================================================
// CLINICS
// =================================================================

// Basic service shape for nesting inside Clinic
export type ClinicService = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
};

// Basic doctor shape for nesting inside Clinic
export type ClinicDoctor = {
  id: string;
  fullName: string;
  specialtyText: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
};

export type Clinic = InferSelectModel<typeof schema.clinics> & {
    latitude?: number;
    longitude?: number;
    phone?: string | null;
    website?: string | null;
    // Supabase address fields
    full_address?: string | null;
    street_address?: string | null;
    locality?: string | null;
    region?: string | null;
    postal_code?: string | null;
    // Address can be stored as JSONB in database (Drizzle format)
    address?: {
        street?: string;
        city?: string;
        cityMunicipality?: string;
        province?: string;
        zipCode?: string;
        barangay?: string;
    } | null;
    // Individual address fields for backward compatibility (legacy)
    street?: string | null;
    cityMunicipality?: { name: string, code: string } | string | null;
    province?: { name: string, code: string } | string | null;
    zipCode?: string | null;
    distance?: number;
    services?: ClinicService[];
    doctors?: ClinicDoctor[];
};
export type NewClinic = InferInsertModel<typeof schema.clinics>;

// =================================================================
// DOCTORS (PROFESSIONALS)
// =================================================================
export type Doctor = InferSelectModel<typeof schema.doctors>;
export type NewDoctor = InferInsertModel<typeof schema.doctors>;

// =================================================================
// SERVICES & CATEGORIES
// =================================================================
export type ServiceCategory = InferSelectModel<typeof schema.serviceCategories>;
export type NewServiceCategory = InferInsertModel<
  typeof schema.serviceCategories
>;

export type Service = InferSelectModel<typeof schema.services>;
export type NewService = InferInsertModel<typeof schema.services>;

// Custom type for services that include the nested category object
export type ServiceWithCategory = Service & {
  serviceCategory: {
    id: string;
    name: string;
  } | null;
};

// =================================================================
// APPOINTMENTS
// =================================================================
export type Appointment = InferSelectModel<typeof schema.appointments>;
export type NewAppointment = InferInsertModel<typeof schema.appointments>;

// To satisfy the simplified booking flow, let's make doctorId optional
// on the type used by the frontend form.
export type AppointmentBookingPayload = {
  clinic_id: string;
  doctor_id: string;
  service_id: string;
  appointment_time: string; // ISO 8601 format
  patient_notes?: string;
};

// =================================================================
// HEALTH LOGS & RECORDS
// =================================================================
export type MedicalRecord = InferSelectModel<typeof schema.medicalRecords>;
export type NewMedicalRecord = InferInsertModel<typeof schema.medicalRecords>;

export type DoctorNote = InferSelectModel<typeof schema.recordDoctorNotes>;
export type NewDoctorNote = InferInsertModel<typeof schema.recordDoctorNotes>;

export type Prescription = InferSelectModel<typeof schema.recordPrescriptions>;
export type NewPrescription = InferInsertModel<typeof schema.recordPrescriptions>;

export type ClinicalDocument = InferSelectModel<typeof schema.recordDocuments>;
export type NewClinicalDocument = InferInsertModel<typeof schema.recordDocuments>;

// =================================================================
// REVIEWS
// =================================================================
export type Review = InferSelectModel<typeof schema.reviews>;
export type NewReview = InferInsertModel<typeof schema.reviews>;

// =================================================================
// E-COMMERCE (PRODUCTS, INVENTORY, ORDERS)
// =================================================================
export type ProductCategory = InferSelectModel<typeof schema.productCategories>;
export type NewProductCategory = InferInsertModel<
  typeof schema.productCategories
>;

export type Product = InferSelectModel<typeof schema.products>;
export type NewProduct = InferInsertModel<typeof schema.products>;

export type Inventory = InferSelectModel<typeof schema.inventory>;
export type NewInventory = InferInsertModel<typeof schema.inventory>;

// =================================================================
// RELATIONAL / JOIN TABLES
// =================================================================

// --- Custom Types with Relations (for specific component needs) ---

// The Doctor type may or may not have the full profile.
export type DoctorWithProfile = Doctor & {
  profile?: Profile;
  fullName?: string; // Add fullName for convenience
};

// This type is used by the frontend to display appointment details.
export type AppointmentWithRelations = Appointment & {
  patient?: Profile;
  doctor: DoctorWithProfile | null;
  clinic: Clinic | null;
  service: Service | null;
  medicalRecords?: MedicalRecordWithDetails[];
};

export type AppointmentDetails = Appointment & {
  patient: Profile;
  doctor: Doctor;
  clinic: Clinic;
  service: Service;
  medicalRecords: MedicalRecordWithDetails[];
};

export type ProductWithStockAndCategory = Product & {
  categoryName: string;
  quantityOnHand: number;
  serviceName: string;
};

export type AdminAppointment = Appointment & {
  patientName: string;
  doctorName: string;
  clinicName: string;
  serviceName: string;
};

export type AdminUser = UserProfile & {
  email: string;
  role: string;
  fullName: string;
};

// --- Custom Types for API responses / UI Components ---
export type UserProfile = Profile;

export type DashboardAppointment = {
  id: string;
  appointment_date: string;
  status: "scheduled" | "cancelled" | "completed";
  serviceName: string;
  doctorName: string;
  clinicName: string;
};

export type DashboardMedicalRecord = {
    id: string;
    appointmentId: string;
    title: string;
    summary: string;
    createdAt: string;
    serviceName: string; 
};

export const adminServiceSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    durationMinutes: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    serviceCategory: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
});
export type AdminService = z.infer<typeof adminServiceSchema>;

export const adminDoctorSchema = z.object({
    id: z.string(),
    userId: z.string(),
    fullName: z.string(),
    serviceCategory: z.object({ 
        id: z.string(),
        name: z.string() 
    }).nullable(),
    clinics: z.array(z.object({ id: z.string(), name: z.string() })),
    services: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type AdminDoctor = z.infer<typeof adminDoctorSchema>;

export const adminProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.string(), // This should probably be z.number() as well, but out of scope for now.
    isActive: z.boolean(),
    categoryName: z.string(),
    quantityOnHand: z.number(),
});
export type AdminProduct = z.infer<typeof adminProductSchema>;

// =================================================================
// API & CUSTOM DTOs
// =================================================================

export type AdminStats = {
  totalUsers: number;
  totalClinics: number;
  totalDoctors: number;
  totalServices: number;
  upcomingAppointments: number;
  productsOutOfStock: number;
};

// --- Custom Types for Enriched Data ---
export type MedicalRecordWithDetails = MedicalRecord & {
    details: DoctorNote | Prescription | ClinicalDocument | null;
}

export type MedicalRecordWithRelations = {
  recordId: string;
  recordType: 'DOCTOR_NOTE' | 'PRESCRIPTION' | 'CLINICAL_DOCUMENT' | 'LAB_ORDER' | 'LAB_RESULT';
  createdAt: string;
  details: DoctorNote | Prescription | ClinicalDocument | null;
  appointment: {
    id: string;
    appointmentTime: string;
  };
  doctor: {
    fullName: string | null;
  };
  clinic: {
    name: string | null;
  };
  service: {
    name: string | null;
  };
};

export const adminUserSchema = z.object({
    id: z.string(),
    // ... existing code ...
});
