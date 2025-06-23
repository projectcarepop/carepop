import { z } from 'zod';

export const clinicFormSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  full_address: z.string().min(10, { message: "Please enter a complete address." }),
  contact_email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  contact_phone: z.string().min(7, { message: "Please enter a valid phone number." }).optional().or(z.literal('')),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type ClinicFormData = z.infer<typeof clinicFormSchema>;

// This type defines the shape of a single clinic object
// It should match the data structure returned by the backend API

export interface Clinic {
  id: string;
  name: string;
  isActive: boolean;
  streetAddress: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  latitude: string | null;
  longitude: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  operationDays: string[] | null;
  operationHours: string | null;
  fpopChapterAffiliation: string | null;
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
} 