import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleInitial: z.string().max(5).optional(),
  birthday: z.date({
    required_error: "Please select a date",
    invalid_type_error: "That's not a date!",
  }),
  contactNo: z.string().min(1, 'Contact number is required'),
  street: z.string().min(1, 'Street address is required'),
  provinceCode: z.string().min(1, 'Province is required'),
  cityMunicipalityCode: z.string().min(1, 'City/Municipality is required'),
  barangayCode: z.string().min(1, 'Barangay is required'),
  
  // Optional fields
  civilStatus: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  philhealthNo: z.string().optional(),
  genderIdentity: z.string().optional(),
  pronouns: z.string().optional(),
  assignedSexAtBirth: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>; 