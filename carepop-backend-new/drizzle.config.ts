import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set in .env file');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_URL,
  },
  introspect: {
    casing: 'camel',
  },
}); 