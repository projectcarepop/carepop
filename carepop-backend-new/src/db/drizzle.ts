import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.SUPABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const client = postgres(process.env.SUPABASE_URL);
export const db = drizzle(client, { schema }); 