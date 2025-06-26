import { z } from 'zod';

export const profileFormSchema = z.object({
    // --- STEP 1 ---
    firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).max(50),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(50),
    middleInitial: z.string().max(1).optional(),
    birthday: z.string().min(1, { message: "Please select your date of birth." }),
    civilStatus: z.string().min(1, { message: "Please select your civil status." }),
    genderIdentity: z.string().min(1, { message: "Please select your gender identity." }),
    pronouns: z.string().min(1, { message: "Please select your pronouns." }),
    assignedSexAtBirth: z.string().min(1, { message: "Please select your assigned sex at birth." }),
    
    // --- STEP 2 ---
    street: z.string().min(2, { message: "Please enter your street address." }),
    provinceCode: z.string().min(1, { message: "Please select a province." }),
    cityMunicipalityCode: z.string().min(1, { message: "Please select a city or municipality." }),
    barangayCode: z.string().min(1, { message: "Please select a barangay." }),
    contactNo: z.string().regex(/^09\d{9}$/, { message: "Please enter a valid 11-digit phone number starting with 09." }),
    
    // --- Genuinely Optional Fields ---
    religion: z.string().optional(),
    occupation: z.string().optional(),
    philhealthNo: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;