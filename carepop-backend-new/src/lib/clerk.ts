import { createClerkClient } from '@clerk/backend';
import { env } from '../config';

if (!env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
}

export const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY }); 