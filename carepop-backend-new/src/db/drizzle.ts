import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_DATABASE_URL is not set in .env file');
}

export const client = postgres(connectionString, {
  ssl: 'require',
  // @ts-ignore - a valid parameter not yet in the type definitions
  family: 4, // Force IPv4 connection
});
export const db = drizzle(client, { schema }); 