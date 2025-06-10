import { z } from 'zod';

export const commonSchemas = {
  // A standard UUID format check
  uuid: z.string().uuid({ message: "Invalid UUID format." }),

  // A non-empty string with a minimum length
  nonEmptyString: z.string().min(1, { message: "This field cannot be empty." }),

  // Optional string that can be null or undefined
  optionalString: z.string().optional().nullable(),

  // A positive integer
  positiveInteger: z.number().int().positive({ message: "Must be a positive number." }),

  // Optional positive integer
  optionalPositiveInteger: z.number().int().positive({ message: "Must be a positive number." }).optional().nullable(),

  // A non-negative number (for prices, costs, etc.)
  nonNegativeNumber: z.number().min(0, { message: "Cannot be a negative number." }),

  // Optional non-negative number
  optionalNonNegativeNumber: z.number().min(0, { message: "Cannot be a negative number." }).optional().nullable(),
}; 