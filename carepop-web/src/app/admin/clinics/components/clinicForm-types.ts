import * as z from "zod";

export const clinicFormSchema = z.object({
  name: z.string().min(1, { message: "Clinic name is required." }),
  fullAddress: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  locality: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email({ message: "Invalid email address." }).optional().nullable(),
  websiteUrl: z.string().url({ message: "Invalid URL." }).optional().nullable(),
  operatingHours: z.string().optional().nullable(),
  services: z.array(z.string()).optional(),
  fpopChapterAffiliation: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>; 