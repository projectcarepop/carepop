import * as z from "zod";

export const dayAvailabilitySchema = z.object({
  isActive: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

export const weeklyAvailabilitySchema = z.object({
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

export const providerFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean(),
  services: z.array(z.string()).optional(),
  weeklyAvailability: weeklyAvailabilitySchema,
});

export type ProviderFormValues = z.infer<typeof providerFormSchema>; 