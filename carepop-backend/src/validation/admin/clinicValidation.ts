import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createClinicSchema = z.object({
  name: commonSchemas.nonEmptyString,
  full_address: commonSchemas.nonEmptyString,
  street_address: commonSchemas.optionalString,
  locality: commonSchemas.optionalString,
  region: commonSchemas.optionalString,
  postal_code: commonSchemas.optionalString,
  country_code: commonSchemas.optionalString,
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  contact_phone: commonSchemas.optionalString,
  contact_email: z.string().email().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  operating_hours: commonSchemas.optionalString,
  is_active: z.boolean().default(true),
});

export const updateClinicSchema = createClinicSchema.partial(); 