// This file will handle loading and validating environment variables
// and exporting them for use throughout the application.

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  WEB_APP_URL: z.string().url({ message: 'WEB_APP_URL must be a valid URL.'}),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env); 