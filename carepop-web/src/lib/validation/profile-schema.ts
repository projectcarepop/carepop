import { z } from 'zod';

export const profileFormSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).max(50),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(50),
    middleInitial: z.string().max(1).optional(),
    contactNo: z.string().min(10, { message: "Please enter a valid 10 or 11-digit phone number." }).max(11).optional(),
    birthday: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', {
        message: 'Please enter a valid date of birth.',
    }).optional(),
    genderIdentity: z.string().optional(),
    pronouns: z.string().optional(),
    assignedSexAtBirth: z.string().optional(),
    civilStatus: z.string().optional(),
    religion: z.string().optional(),
    occupation: z.string().optional(),
    street: z.string().optional(),
    barangayCode: z.string().optional(),
    cityMunicipalityCode: z.string().optional(),
    provinceCode: z.string().optional(),
    philhealthNo: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>; 