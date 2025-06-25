import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';
import path from 'path';

// Load environment variables explicitly from the backend project root
// Note: This assumes your .env file is in the root of the 'carepop-backend-v2' directory
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Attempting to load .env file from: ${envPath}`);
import('dotenv').then(dotenv => dotenv.config({ path: envPath }));


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the .env file');
}

const main = async () => {
  console.log('Running migrations...');

  const dbConnection = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(dbConnection);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations completed!');
  process.exit(0);
};

main().catch((err) => {
  console.error('Migration failed:');
  console.error(err);
  process.exit(1);
}); 