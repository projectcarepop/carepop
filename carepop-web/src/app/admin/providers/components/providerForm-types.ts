import { z } from 'zod';

export const timeSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

export const weeklyAvailabilitySchema = z.object({
  day: z.string(),
  slots: z.array(timeSlotSchema),
});

export const providerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  credentials: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  serviceIds: z.array(z.string()).optional(),
  weeklyAvailability: z.array(weeklyAvailabilitySchema).optional(),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;
export type ProviderFormValues = z.infer<typeof providerFormSchema>; 